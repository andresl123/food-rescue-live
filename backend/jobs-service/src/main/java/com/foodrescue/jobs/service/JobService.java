package com.foodrescue.jobs.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodrescue.jobs.entity.OrderDocument;
import com.foodrescue.jobs.model.Job;
import com.foodrescue.jobs.repository.JobRepository;
import com.foodrescue.jobs.repository.OrderRepository;
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
import java.util.UUID;

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

    public Mono<ApiResponse<Job>> create(Job job) {
        if (job.getJobId() == null || job.getJobId().isBlank()) {
            job.setJobId(generateJobId());
        }
        job.setAssignedAt(job.getAssignedAt() == null ? Instant.now() : job.getAssignedAt());
        return jobs.save(job)
                .map(ApiResponse::created)
                .onErrorResume(ex -> {
                    log.error("Failed to create job", ex);
                    return Mono.just(ApiResponse.error("Failed to create job"));
                });
    }

    public Mono<ApiResponse<Job>> createFromOrderId(String orderId) {
        Job job = Job.builder()
                .jobId(generateJobId())
                .orderId(orderId)
                .status("UNASSIGNED")
                .assignedAt(Instant.now())
                .notes("Auto-created for lot reservation")
                .build();
        return jobs.save(job)
                .map(ApiResponse::created)
                .onErrorResume(ex -> {
                    log.error("Failed to create job from order {}", orderId, ex);
                    return Mono.just(ApiResponse.error("Failed to create job from order ID"));
                });
    }

    public Flux<Job> getAllJobs() {
        return jobs.findAll();
    }

    public Flux<Job> getByOrderId(String orderId) {
        return jobs.findByOrderId(orderId);
    }

    public Flux<Job> getByStatus(String status) {
        return jobs.findByStatus(status);
    }

    public Flux<Job> getByCourierId(String courierId) {
        return jobs.findByCourierId(courierId);
    }

    public Flux<Job> getByCourierIdAndStatus(String courierId, String status) {
        return jobs.findByCourierIdAndStatus(courierId, status);
    }

    public Flux<Job> getAvailableJobs() {
        log.debug("Fetching available jobs");
        return jobs.findAvailableJobs();
    }

    public Mono<ApiResponse<Job>> getById(String id) {
        return jobs.findById(id)
                .map(ApiResponse::ok)
                .switchIfEmpty(Mono.just(ApiResponse.error("Job not found")));
    }

    public Mono<ApiResponse<OrderDocument>> getOrderById(String orderId) {
        return orders.findById(orderId)
                .map(order -> {
                    if (order.getStatus() == null) {
                        order.setStatus("CREATED");
                    }
                    return ApiResponse.ok(order);
                })
                .switchIfEmpty(Mono.just(ApiResponse.error("Order not found")))
                .onErrorResume(ex -> {
                    log.error("Failed to fetch order {}", orderId, ex);
                    return Mono.just(ApiResponse.error("Failed to fetch order: " + ex.getMessage()));
                });
    }

    public Mono<ApiResponse<AddressDto>> getAddressById(String addressId) {
        return webClientBuilder.build()
                .get()
                .uri(authBaseUrl + "/addresses/{id}", addressId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .map(response -> {
                    boolean success = Boolean.TRUE.equals(response.get("success"));
                    if (success && response.get("data") != null) {
                        AddressDto dto = objectMapper.convertValue(response.get("data"), AddressDto.class);
                        return ApiResponse.ok(dto);
                    }
                    return ApiResponse.<AddressDto>error(
                            response.getOrDefault("message", "Address not found").toString()
                    );
                })
                .onErrorResume(ex -> {
                    log.error("Failed to fetch address {}", addressId, ex);
                    return Mono.just(ApiResponse.error("Failed to fetch address: " + ex.getMessage()));
                });
    }

    public Mono<ApiResponse<UserDto>> getReceiverForOrder(String orderId) {
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

    public Mono<ApiResponse<Job>> updateStatus(String jobId, String status) {
        return jobs.findById(jobId)
                .flatMap(job -> {
                    job.setStatus(status);
                    job.setUpdatedAt(Instant.now());
                    if (isTerminalStatus(status) && job.getCompletedAt() == null) {
                        job.setCompletedAt(Instant.now());
                    }
                    return jobs.save(job);
                })
                .map(ApiResponse::ok)
                .switchIfEmpty(Mono.just(ApiResponse.error("Job not found")));
    }

    public Mono<ApiResponse<Job>> assignCourier(String jobId, String courierId) {
        log.info("Assigning courier {} to job {}", courierId, jobId);
        return jobs.findById(jobId)
                .flatMap(job -> {
                    job.setCourierId(courierId);
                    job.setStatus("ASSIGNED");
                    job.setUpdatedAt(Instant.now());
                    if (job.getAssignedAt() == null) {
                        job.setAssignedAt(Instant.now());
                    }
                    return jobs.save(job);
                })
                .map(ApiResponse::ok)
                .switchIfEmpty(Mono.just(ApiResponse.error("Job not found")));
    }

    public Mono<ApiResponse<Job>> unassignCourier(String jobId) {
        log.info("Unassigning courier from job {}", jobId);
        return jobs.findById(jobId)
                .flatMap(job -> {
                    job.setCourierId(null);
                    job.setStatus("CANCELLED");
                    job.setUpdatedAt(Instant.now());
                    if (job.getCompletedAt() == null) {
                        job.setCompletedAt(Instant.now());
                    }
                    return jobs.save(job);
                })
                .map(ApiResponse::ok)
                .switchIfEmpty(Mono.just(ApiResponse.error("Job not found")));
    }

    public Mono<ApiResponse<Job>> markAsPickedUp(String jobId) {
        return markStatus(jobId, "PICKED_UP");
    }

    public Mono<ApiResponse<Job>> markAsInTransit(String jobId) {
        return markStatus(jobId, "IN_TRANSIT");
    }

    public Mono<ApiResponse<Job>> markAsOutForDelivery(String jobId) {
        return markStatus(jobId, "OUT_FOR_DELIVERY");
    }

    public Mono<ApiResponse<Job>> markAsDelivered(String jobId) {
        return jobs.findById(jobId)
                .flatMap(job -> {
                    job.setStatus("DELIVERED");
                    job.setUpdatedAt(Instant.now());
                    if (job.getCompletedAt() == null) {
                        job.setCompletedAt(Instant.now());
                    }
                    return jobs.save(job);
                })
                .map(ApiResponse::ok)
                .switchIfEmpty(Mono.just(ApiResponse.error("Job not found")));
    }

    public Mono<ApiResponse<Job>> markAsFailed(String jobId) {
        return markStatus(jobId, "FAILED");
    }

    public Mono<ApiResponse<Job>> markAsCancelled(String jobId) {
        return jobs.findById(jobId)
                .flatMap(job -> {
                    job.setStatus("CANCELLED");
                    job.setUpdatedAt(Instant.now());
                    if (job.getCompletedAt() == null) {
                        job.setCompletedAt(Instant.now());
                    }
                    return jobs.save(job);
                })
                .map(ApiResponse::ok)
                .switchIfEmpty(Mono.just(ApiResponse.error("Job not found")));
    }

    public Mono<ApiResponse<Job>> markAsReturned(String jobId) {
        return markStatus(jobId, "RETURNED");
    }

    private Mono<ApiResponse<Job>> markStatus(String jobId, String status) {
        return jobs.findById(jobId)
                .flatMap(job -> {
                    job.setStatus(status);
                    job.setUpdatedAt(Instant.now());
                    return jobs.save(job);
                })
                .map(ApiResponse::ok)
                .switchIfEmpty(Mono.just(ApiResponse.error("Job not found")));
    }

    private Mono<UserDto> fetchUserById(String userId) {
        if (userId == null || userId.isBlank()) {
            return Mono.empty();
        }

        return webClientBuilder.build()
                .get()
                .uri(authBaseUrl + "/users/{id}", userId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .map(response -> {
                    boolean success = Boolean.TRUE.equals(response.get("success"));
                    if (success && response.get("data") != null) {
                        return objectMapper.convertValue(response.get("data"), UserDto.class);
                    }
                    return null;
                })
                .filter(Objects::nonNull)
                .onErrorResume(ex -> {
                    log.error("Failed to fetch user {}", userId, ex);
                    return Mono.empty();
                });
    }

    private boolean isTerminalStatus(String status) {
        if (status == null) {
            return false;
        }
        return switch (status.toUpperCase()) {
            case "DELIVERED", "FAILED", "CANCELLED", "RETURNED" -> true;
            default -> false;
        };
    }

    private String generateJobId() {
        return "JOB-" + UUID.randomUUID();
    }
}

