package com.foodrescue.jobs.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodrescue.jobs.entity.OrderDocument;
import com.foodrescue.jobs.model.Job;
import com.foodrescue.jobs.repository.JobRepository;
import com.foodrescue.jobs.repository.OrderRepository;
import com.foodrescue.jobs.web.response.AddressDto;
import com.foodrescue.jobs.web.response.ApiResponse;
import com.foodrescue.jobs.web.response.RecentOrderDto;
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
import java.time.temporal.ChronoUnit;
import java.time.Instant;
import com.foodrescue.jobs.web.response.AdminOrderView;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import com.foodrescue.jobs.web.response.FoodItemDto;
import com.foodrescue.jobs.web.response.PodDto;
import java.util.stream.Collectors;

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
    private final CourierStatsService courierStatsService;

    @Value("${services.pods.base-url:http://localhost:8083/api/v1}") // PODs service
    private String podsBaseUrl;

    @Value("${services.fooditems.base-url:http://localhost:8081/api/v1}") // Food-Items service
    private String foodItemsBaseUrl;

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
    public Flux<RecentOrderDto> getRecentOrders(Mono<Authentication> authMono) {
        return orders.findTop5ByOrderByOrderDateDesc()
                .concatMap(order -> {
                    Mono<Job> jobMono = jobs.findByOrderId(order.getId())
                            .next()
                            .defaultIfEmpty(new Job());
                    Mono<UserDto> recipientMono = fetchUserById(order.getReceiverId(), authMono) // Pass authMono
                            .defaultIfEmpty(new UserDto());

                    return Mono.zip(Mono.just(order), jobMono, recipientMono);
                })
                .map(tuple -> {
                    OrderDocument order = tuple.getT1();
                    Job job = tuple.getT2();
                    UserDto recipient = tuple.getT3();

                    String finalStatus;
                    if (job.getJobId() == null) {
                        finalStatus = "PENDING";
                    } else {
                        finalStatus = job.getStatus();
                    }
                    String recipientName = (recipient.getName() == null) ? "Unknown Recipient" : recipient.getName();

                    return new RecentOrderDto(
                            order.getId(),
                            recipientName,
                            finalStatus
                    );
                });
    }

    public Mono<Long> countOrdersToday() {
        // Get the current time and truncate it to the start of the day (in UTC)
        Instant startOfDay = Instant.now().truncatedTo(ChronoUnit.DAYS);

        return orders.countByOrderDateAfter(startOfDay);
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

    public Mono<ApiResponse<UserDto>> getReceiverForOrder(
            String orderId,
            Mono<Authentication> authMono) {

        log.info("Fetching receiver info for order {}", orderId);
        return orders.findById(orderId)
                .flatMap(order -> fetchUserById(order.getReceiverId(), authMono) // Pass authMono
                        .map(ApiResponse::ok)
                        .switchIfEmpty(Mono.just(ApiResponse.error("Receiver user not found"))))
                .switchIfEmpty(Mono.just(ApiResponse.error("Order not found")))
                .onErrorResume(ex -> {
                    log.error("Failed to fetch receiver for order {}", orderId, ex);
                    return Mono.just(ApiResponse.error("Failed to fetch receiver: " + ex.getMessage()));
                });
    }

    public Mono<ApiResponse<UserNameDto>> getUserById(
            String userId,
            Mono<Authentication> authMono) {

        return fetchUserById(userId, authMono)
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
                    return saveAndRefresh(job);
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
                    return saveAndRefresh(job);
                })
                .map(ApiResponse::ok)
                .switchIfEmpty(Mono.just(ApiResponse.error("Job not found")));
    }

    public Mono<ApiResponse<Job>> unassignCourier(String jobId) {
        log.info("Unassigning courier from job {}", jobId);
        return jobs.findById(jobId)
                .flatMap(job -> {
                    String previousCourier = job.getCourierId();
                    job.setCourierId(null);
                    job.setStatus("CANCELLED");
                    job.setUpdatedAt(Instant.now());
                    if (job.getCompletedAt() == null) {
                        job.setCompletedAt(Instant.now());
                    }
                    return saveAndRefresh(job, previousCourier);
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
                    return saveAndRefresh(job);
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
                    return saveAndRefresh(job);
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
                    return saveAndRefresh(job);
                })
                .map(ApiResponse::ok)
                .switchIfEmpty(Mono.just(ApiResponse.error("Job not found")));
    }

    private Mono<UserDto> fetchUserById(String userId, Mono<Authentication> authMono) {
        if (userId == null || userId.trim().isEmpty()) {
            return Mono.empty();
        }

        return authMono.flatMap(auth -> Mono.just(((Jwt) auth.getPrincipal()).getTokenValue()))
                .flatMap(token ->
                        webClientBuilder.build()
                                .get()
                                .uri(authBaseUrl + "/api/v1/users/{id}", userId)
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token) // <-- Add auth header
                                .retrieve()
                                .bodyToMono(new ParameterizedTypeReference<ApiResponse<UserDto>>() {})
                                .map(apiResponse -> {
                                    if (apiResponse.success() && apiResponse.data() != null) {
                                        return apiResponse.data();
                                    }
                                    return null;
                                })
                                .filter(Objects::nonNull)
                                .onErrorResume(ex -> {
                                    log.error("Failed to fetch user {}", userId, ex);
                                    return Mono.empty();
                                })
                );
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

    // --- Fetch POD ---
    private Mono<PodDto> fetchPodByJobId(String jobId, Mono<Authentication> authMono) {
        if (jobId == null || jobId.trim().isEmpty()) {
            return Mono.just(new PodDto("N/A", "N/A"));
        }

        return authMono.flatMap(auth -> Mono.just(((Jwt) auth.getPrincipal()).getTokenValue()))
                .flatMap(token ->
                        webClientBuilder.build()
                                .get()
                                .uri(podsBaseUrl + "/api/v1/pods/latest/{jobId}", jobId)
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token) // <-- Add auth header
                                .retrieve()
                                .bodyToMono(new ParameterizedTypeReference<ApiResponse<PodDto>>() {})
                                .map(apiResponse -> {
                                    if (apiResponse.success() && apiResponse.data() != null) {
                                        return apiResponse.data();
                                    }
                                    return new PodDto("N/A", "N/A");
                                })
                                .defaultIfEmpty(new PodDto("N/A", "N/A"))
                                .onErrorResume(ex -> {
                                    log.error("Failed to fetch POD for job {}: {}", jobId, ex.getMessage());
                                    return Mono.just(new PodDto("N/A", "N/A"));
                                })
                );
    }

    // --- Fetch Food Items ---
    private Mono<String> fetchItemsByLotId(String lotId, Mono<Authentication> authMono) {
        if (lotId == null || lotId.trim().isEmpty()) {
            return Mono.just("Unknown Items");
        }

        return authMono.flatMap(auth -> Mono.just(((Jwt) auth.getPrincipal()).getTokenValue()))
                .flatMap(token ->
                        webClientBuilder.build()
                                .get()
                                .uri(foodItemsBaseUrl + "/api/v1/lots/{lotId}/items", lotId)
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token) // <-- Add auth header
                                .retrieve()
                                .bodyToFlux(FoodItemDto.class)
                                .map(FoodItemDto::itemName)
                                .collect(Collectors.joining(", "))
                                .defaultIfEmpty("No items found")
                                .onErrorResume(ex -> Mono.just("Error fetching items"))
                );
    }

    // --- AGGREGATION METHOD ---
    public Flux<AdminOrderView> getAdminOrderView(Mono<Authentication> authMono) {
        return jobs.findAll()
                .concatMap(job -> {
                    Mono<OrderDocument> orderMono = orders.findById(job.getOrderId())
                            .defaultIfEmpty(new OrderDocument());
                    Mono<PodDto> podMono = fetchPodByJobId(job.getJobId(), authMono); // Pass authMono

                    return Mono.zip(Mono.just(job), orderMono, podMono);
                })
                .concatMap(tuple -> {
                    Job job = tuple.getT1();
                    OrderDocument order = tuple.getT2();
                    PodDto pod = tuple.getT3();

                    Mono<UserDto> recipientMono = fetchUserById(order.getReceiverId(), authMono) // Pass authMono
                            .defaultIfEmpty(new UserDto());
                    Mono<String> itemsMono = fetchItemsByLotId(order.getLotId(), authMono); // Pass authMono

                    return Mono.zip(
                            Mono.just(job),
                            Mono.just(pod),
                            recipientMono,
                            itemsMono
                    );
                })
                .map(tuple -> {
                    Job job = tuple.getT1();
                    PodDto pod = tuple.getT2();
                    UserDto recipient = tuple.getT3();
                    String items = tuple.getT4();
                    String recipientName = (recipient.getName() == null) ? "Unknown Recipient" : recipient.getName();

                    return new AdminOrderView(
                            job.getOrderId(), job.getJobId(), recipientName, items,
                            pod.getPickupCode(), pod.getDeliveryCode(), job.getCompletedAt(), job.getStatus()
                    );
                });
    }
    public Mono<Job> getSingleJobByOrderId(String orderId) {
        return jobs.findByOrderId(orderId).next(); // takes the first job, if any
    }

    private Mono<Job> saveAndRefresh(Job job) {
        return jobs.save(job)
                .flatMap(saved -> courierStatsService.refreshForCourier(saved.getCourierId())
                        .thenReturn(saved));
    }

    private Mono<Job> saveAndRefresh(Job job, String courierIdToRefresh) {
        return jobs.save(job)
                .flatMap(saved -> courierStatsService.refreshForCourier(
                                courierIdToRefresh != null ? courierIdToRefresh : saved.getCourierId())
                        .thenReturn(saved));
    }
}

