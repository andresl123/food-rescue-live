package com.foodrescue.jobs.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodrescue.jobs.entity.OrderDocument;
import com.foodrescue.jobs.model.Job;
import com.foodrescue.jobs.model.JobStatus;
import com.foodrescue.jobs.repository.JobRepository;
import com.foodrescue.jobs.repository.OrderRepository;
import com.foodrescue.jobs.web.response.AddressDto;
import com.foodrescue.jobs.web.response.AddressDto;
import com.foodrescue.jobs.web.response.ApiResponse;
import com.foodrescue.jobs.web.response.UserDto;
import com.foodrescue.jobs.web.response.UserNameDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobService {

    private final JobRepository jobs;
    private final OrderRepository orders;
    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${auth.base-url:http://localhost:8080/api/v1}")
    private String authBaseUrl;

    /**
     * Generates a unique job ID
     */
    private String generateJobId() {
        return "JOB-" + System.currentTimeMillis();
    }

    public Mono<ApiResponse<Job>> create(Job job) {
        // Auto-generate jobId if not provided
        if (job.getJobId() == null || job.getJobId().trim().isEmpty()) {
            job.setJobId(generateJobId());
        }
        job.setAssignedAt(job.getAssignedAt() == null ? Instant.now() : job.getAssignedAt());
        return jobs.save(job)
                .map(ApiResponse::created)
                .onErrorReturn(ApiResponse.error("Failed to create job"));
    }

    public Mono<ApiResponse<Job>> createFromOrderId(String orderId) {
        Job job = new Job();
        job.setJobId(generateJobId()); // Auto-generate unique job ID
        job.setOrderId(orderId);
        // Status will be set when courier is assigned
        job.setAssignedAt(Instant.now());
        
        return jobs.save(job)
                .map(ApiResponse::created)
                .onErrorReturn(ApiResponse.error("Failed to create job from order ID"));
    }

    public Mono<ApiResponse<OrderDocument>> getOrderById(String orderId) {
        log.info("Fetching order {} from orders collection", orderId);
        return orders.findById(orderId)
                .map(ApiResponse::ok)
                .switchIfEmpty(Mono.just(ApiResponse.error("Order not found")))
                .onErrorResume(ex -> {
                    log.error("Failed to fetch order {}", orderId, ex);
                    return Mono.just(ApiResponse.error("Failed to fetch order: " + ex.getMessage()));
                });
    }

    public Mono<ApiResponse<AddressDto>> getAddressById(String addressId) {
        log.info("Fetching address {} from auth service", addressId);
        return webClientBuilder.build()
                .get()
                .uri(authBaseUrl + "/addresses/{id}", addressId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .map(responseMap -> {
                    boolean success = Boolean.TRUE.equals(responseMap.get("success"));
                    if (success && responseMap.get("data") != null) {
                        AddressDto address = objectMapper.convertValue(responseMap.get("data"), AddressDto.class);
                        return ApiResponse.ok(address);
                    }
                    String message = responseMap.getOrDefault("message", "Address not found").toString();
                    return ApiResponse.<AddressDto>error(message);
                })
                .onErrorResume(ex -> {
                    log.error("Failed to fetch address {}", addressId, ex);
                    return Mono.just(ApiResponse.<AddressDto>error("Failed to fetch address: " + ex.getMessage()));
                });
    }

    public Mono<ApiResponse<UserNameDto>> getUserById(String userId) {
        return fetchUserById(userId)
                .map(user -> {
                    UserNameDto dto = new UserNameDto();
                    dto.setId(user.getId());
                    dto.setName(user.getName());
                    return ApiResponse.ok(dto);
                })
                .switchIfEmpty(Mono.just(ApiResponse.error("User not found")));
    }

    public Mono<ApiResponse<UserDto>> getReceiverForOrder(String orderId) {
        log.info("Fetching receiver info for order {}", orderId);
        return orders.findById(orderId)
                .flatMap(order -> fetchUserById(order.getReceiverId())
                        .map(ApiResponse::ok)
                        .switchIfEmpty(Mono.just(ApiResponse.error("Receiver user not found"))))
                .switchIfEmpty(Mono.just(ApiResponse.error("Order not found")))
                .onErrorResume(ex -> {
                    log.error("Failed to fetch receiver for order {}", orderId, ex);
                    return Mono.just(ApiResponse.error("Failed to fetch receiver: " + ex.getMessage()));
                });
    }

    private Mono<UserDto> fetchUserById(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return Mono.empty();
        }

        return webClientBuilder.build()
                .get()
                .uri(authBaseUrl + "/users/{id}", userId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .map(responseMap -> {
                    boolean success = Boolean.TRUE.equals(responseMap.get("success"));
                    if (success && responseMap.get("data") != null) {
                        return objectMapper.convertValue(responseMap.get("data"), UserDto.class);
                    }
                    return null;
                })
                .filter(Objects::nonNull)
                .onErrorResume(ex -> {
                    log.error("Failed to fetch user {}", userId, ex);
                    return Mono.empty();
                });
    }

    public Mono<ApiResponse<Job>> getById(String id) {
        return jobs.findById(id).map(ApiResponse::ok)
                .switchIfEmpty(Mono.just(ApiResponse.error("Job not found")));
    }

    public Flux<Job> getAllJobs() {
        return jobs.findAll();
    }

    public Flux<Job> getByOrderId(String orderId) { return jobs.findByOrderId(orderId); }
    public Flux<Job> getByStatus(String status) { return jobs.findByStatus(status); }
    public Flux<Job> getByCourierId(String courierId) { return jobs.findByCourierId(courierId); }
    public Flux<Job> getByCourierIdAndStatus(String courierId, String status) { return jobs.findByCourierIdAndStatus(courierId, status); }
    
    public Flux<Job> getAvailableJobs() {
        log.info("Fetching all available jobs (where courierId is null)");
        return jobs.findAvailableJobs()
                .doOnNext(job -> log.debug("Found available job: jobId={}, orderId={}", job.getJobId(), job.getOrderId()))
                .doOnComplete(() -> log.info("Finished fetching available jobs"))
                .doOnError(error -> log.error("Error fetching available jobs", error));
    }

    public Mono<ApiResponse<Job>> updateStatus(String id, String status) {
        return jobs.findById(id)
                .flatMap(j -> {
                    j.setStatus(status);
                    j.setUpdatedAt(Instant.now());
                    // Set completedAt for final statuses
                    if (JobStatus.DELIVERED.equalsIgnoreCase(status) || 
                        JobStatus.FAILED.equalsIgnoreCase(status) || 
                        JobStatus.CANCELLED.equalsIgnoreCase(status) ||
                        JobStatus.RETURNED.equalsIgnoreCase(status)) {
                        if (j.getCompletedAt() == null) {
                            j.setCompletedAt(Instant.now());
                        }
                    }
                    return jobs.save(j);
                })
                .map(ApiResponse::ok)
                .switchIfEmpty(Mono.just(ApiResponse.error("Job not found")));
    }

    public Mono<ApiResponse<Job>> assignCourier(String jobId, String courierId) {
        log.info("Assigning courier {} to job: {}", courierId, jobId);
        return jobs.findById(jobId)
                .flatMap(job -> {
                    job.setCourierId(courierId);
                    job.setStatus(JobStatus.ASSIGNED);
                    job.setUpdatedAt(Instant.now());
                    // If assignedAt is null, set it to now (first time assignment)
                    if (job.getAssignedAt() == null) {
                        job.setAssignedAt(Instant.now());
                    }
                    return jobs.save(job);
                })
                .map(ApiResponse::ok)
                .doOnSuccess(job -> log.info("Courier {} assigned successfully to job: {}", courierId, jobId))
                .switchIfEmpty(Mono.just(ApiResponse.error("Job not found")));
    }

    public Mono<ApiResponse<Job>> unassignCourier(String jobId) {
        log.info("Unassigning courier from job: jobId={}", jobId);
        return jobs.findById(jobId)
                .flatMap(job -> {
                    job.setCourierId(null);
                    job.setStatus(JobStatus.CANCELLED);
                    job.setUpdatedAt(Instant.now());
                    if (job.getCompletedAt() == null) {
                        job.setCompletedAt(Instant.now());
                    }
                    return jobs.save(job);
                })
                .map(ApiResponse::ok)
                .doOnSuccess(job -> log.info("Courier unassigned and job cancelled: jobId={}", jobId))
                .switchIfEmpty(Mono.just(ApiResponse.error("Job not found")));
    }

    public Mono<ApiResponse<Job>> markAsPickedUp(String jobId) {
        log.info("Marking job as picked up: jobId={}", jobId);
        return jobs.findById(jobId)
                .flatMap(job -> {
                    job.setStatus(JobStatus.PICKED_UP);
                    job.setUpdatedAt(Instant.now());
                    return jobs.save(job);
                })
                .map(ApiResponse::ok)
                .doOnSuccess(job -> log.info("Job marked as picked up: jobId={}", jobId))
                .switchIfEmpty(Mono.just(ApiResponse.error("Job not found")));
    }

    public Mono<ApiResponse<Job>> markAsInTransit(String jobId) {
        log.info("Marking job as in transit: jobId={}", jobId);
        return jobs.findById(jobId)
                .flatMap(job -> {
                    job.setStatus(JobStatus.IN_TRANSIT);
                    job.setUpdatedAt(Instant.now());
                    return jobs.save(job);
                })
                .map(ApiResponse::ok)
                .doOnSuccess(job -> log.info("Job marked as in transit: jobId={}", jobId))
                .switchIfEmpty(Mono.just(ApiResponse.error("Job not found")));
    }

    public Mono<ApiResponse<Job>> markAsOutForDelivery(String jobId) {
        log.info("Marking job as out for delivery: jobId={}", jobId);
        return jobs.findById(jobId)
                .flatMap(job -> {
                    job.setStatus(JobStatus.OUT_FOR_DELIVERY);
                    job.setUpdatedAt(Instant.now());
                    return jobs.save(job);
                })
                .map(ApiResponse::ok)
                .doOnSuccess(job -> log.info("Job marked as out for delivery: jobId={}", jobId))
                .switchIfEmpty(Mono.just(ApiResponse.error("Job not found")));
    }

    public Mono<ApiResponse<Job>> markAsDelivered(String jobId) {
        log.info("Marking job as delivered: jobId={}", jobId);
        return jobs.findById(jobId)
                .flatMap(job -> {
                    job.setStatus(JobStatus.DELIVERED);
                    job.setUpdatedAt(Instant.now());
                    if (job.getCompletedAt() == null) {
                        job.setCompletedAt(Instant.now());
                    }
                    return jobs.save(job);
                })
                .map(ApiResponse::ok)
                .doOnSuccess(job -> log.info("Job marked as delivered: jobId={}", jobId))
                .switchIfEmpty(Mono.just(ApiResponse.error("Job not found")));
    }

    public Mono<ApiResponse<Job>> markAsFailed(String jobId) {
        log.info("Marking job as failed: jobId={}", jobId);
        return jobs.findById(jobId)
                .flatMap(job -> {
                    job.setStatus(JobStatus.FAILED);
                    job.setUpdatedAt(Instant.now());
                    if (job.getCompletedAt() == null) {
                        job.setCompletedAt(Instant.now());
                    }
                    return jobs.save(job);
                })
                .map(ApiResponse::ok)
                .doOnSuccess(job -> log.info("Job marked as failed: jobId={}", jobId))
                .switchIfEmpty(Mono.just(ApiResponse.error("Job not found")));
    }

    public Mono<ApiResponse<Job>> markAsCancelled(String jobId) {
        log.info("Marking job as cancelled: jobId={}", jobId);
        return jobs.findById(jobId)
                .flatMap(job -> {
                    job.setStatus(JobStatus.CANCELLED);
                    job.setUpdatedAt(Instant.now());
                    if (job.getCompletedAt() == null) {
                        job.setCompletedAt(Instant.now());
                    }
                    return jobs.save(job);
                })
                .map(ApiResponse::ok)
                .doOnSuccess(job -> log.info("Job marked as cancelled: jobId={}", jobId))
                .switchIfEmpty(Mono.just(ApiResponse.error("Job not found")));
    }

    public Mono<ApiResponse<Job>> markAsReturned(String jobId) {
        log.info("Marking job as returned: jobId={}", jobId);
        return jobs.findById(jobId)
                .flatMap(job -> {
                    job.setStatus(JobStatus.RETURNED);
                    job.setUpdatedAt(Instant.now());
                    if (job.getCompletedAt() == null) {
                        job.setCompletedAt(Instant.now());
                    }
                    return jobs.save(job);
                })
                .map(ApiResponse::ok)
                .doOnSuccess(job -> log.info("Job marked as returned: jobId={}", jobId))
                .switchIfEmpty(Mono.just(ApiResponse.error("Job not found")));
    }
}


