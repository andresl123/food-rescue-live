package com.foodrescue.uibff.receiver.service;

import com.foodrescue.uibff.receiver.dto.orders.FoodItemDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;

import java.util.List;

@Service
public class DonorReceiverOrdersService {

    private final WebClient webClient;

    @Value("${services.jobs.base-url}")
    private String jobsBaseUrl;

    @Value("${services.lots.base-url}")
    private String lotsBaseUrl;

    @Value("${services.auth.base-url}")
    private String authBaseUrl;

    @Value("${services.evidence.base-url}")
    private String evidenceBaseUrl; // e.g. http://localhost:8083

    public DonorReceiverOrdersService(WebClient.Builder builder) {
        this.webClient = builder.build();
    }

    // ------------------------------------------------------------
    // DONOR: list of orders
    //
    // Flow:
    //  1) GET lots for donor:   LOTS /api/v1/lots/by-donor/{donorId}
    //  2) For each lot → GET order: JOBS /api/v1/orders/by-lot/{lotId}
    //  3) Aggregate: lot + items + receiver + job + courier + pickupOtp
    // ------------------------------------------------------------
    public Mono<List<DonorOrderSummary>> getDonorOrders(String donorId, String authHeader) {
        String lotsUrl = lotsBaseUrl + "/api/v1/lots/by-donor/" + donorId;
        System.out.println("[BFF] GET " + lotsUrl + " (donor lots)");

        return webClient.get()
                .uri(lotsUrl)
                .headers(h -> {
                    if (authHeader != null) {
                        h.set(HttpHeaders.AUTHORIZATION, authHeader);
                    }
                })
                .retrieve()
                .bodyToFlux(LotDto.class)
                .flatMap(lotDto -> {
                    String lotId = lotDto.getLotId();
                    String orderUrl = jobsBaseUrl + "/api/v1/orders/by-lot/" + lotId;
                    System.out.println("[BFF] GET " + orderUrl + " (order by lot)");

                    return webClient.get()
                            .uri(orderUrl)
                            .headers(h -> {
                                if (authHeader != null) {
                                    h.set(HttpHeaders.AUTHORIZATION, authHeader);
                                }
                            })
                            .retrieve()
                            .bodyToMono(OrderDetailsDto.class)
                            // If no order yet for this lot, just skip
                            .onErrorResume(ex -> {
                                System.out.println("[BFF] No order for lot " + lotId + " or error: " + ex.getMessage());
                                return Mono.empty();
                            })
                            .flatMap(order -> {
                                DonorOrderRow row = new DonorOrderRow(
                                        order.id(),
                                        order.lotId(),
                                        order.receiverId()
                                );
                                return aggregateDonorOrder(row, authHeader);
                            });
                })
                .collectList();
    }

    // ------------------------------------------------------------
    // DONOR: single order by lotId (donorId from JWT)
    //
    // Flow:
    //  1) GET order by lot: JOBS /api/v1/orders/by-lot/{lotId}
    //  2) Aggregate (lot, items, receiver, job, courier, pickupOtp)
    //  3) Filter to ensure lot.userId == donorId
    // ------------------------------------------------------------
    public Mono<DonorOrderSummary> getDonorOrderByLot(String lotId, String donorId, String authHeader) {
        String url = jobsBaseUrl + "/api/v1/orders/by-lot/" + lotId;
        System.out.println("[BFF] GET " + url + " (donor single order by lot)");

        return webClient.get()
                .uri(url)
                .headers(h -> {
                    if (authHeader != null) {
                        h.set(HttpHeaders.AUTHORIZATION, authHeader);
                    }
                })
                .retrieve()
                .bodyToMono(OrderDetailsDto.class)
                .flatMap(order -> {
                    DonorOrderRow row = new DonorOrderRow(
                            order.id(),
                            order.lotId(),
                            order.receiverId()
                    );
                    return aggregateDonorOrder(row, authHeader);
                })
                .filter(summary -> {
                    LotDto lot = summary.lot();
                    return lot != null && donorId != null && donorId.equals(lot.getUserId());
                });
    }

    // Core aggregator for donor view
    private Mono<DonorOrderSummary> aggregateDonorOrder(DonorOrderRow orderRow, String authHeader) {
        final String orderId = orderRow.id();
        final String lotId   = orderRow.lotId();
        final String receiverId = orderRow.receiverId();

        System.out.println("[BFF] ==== aggregating donor order " + orderId + " (lot=" + lotId + ") ====");

        Mono<LotEnvelope> lotMono = fetchLot(lotId, authHeader);
        Mono<List<FoodItemDto>> itemsMono = fetchFoodItems(lotId, authHeader);

        Mono<UserDto> receiverMono = fetchUser(receiverId, authHeader)
                .defaultIfEmpty(new UserDto(receiverId, null, null));

        Mono<JobDto> jobMono = fetchJobByOrder(orderId, authHeader)
                .onErrorResume(ex -> {
                    System.out.println("[BFF] No job for order " + orderId + " or error: " + ex.getMessage());
                    return Mono.empty();
                })
                .defaultIfEmpty(new JobDto(null, orderId, null, null));

        return Mono.zip(lotMono, itemsMono, receiverMono, jobMono)
                .flatMap(tuple -> {
                    LotEnvelope lotEnv = tuple.getT1();
                    List<FoodItemDto> items = tuple.getT2();
                    UserDto receiver = tuple.getT3();
                    JobDto job = tuple.getT4();

                    String jobId = job.jobId();

                    Mono<UserDto> courierMono;
                    if (job.courierId() != null) {
                        courierMono = fetchUser(job.courierId(), authHeader)
                                .defaultIfEmpty(new UserDto(job.courierId(), "To be assigned", null));
                    } else {
                        courierMono = Mono.just(new UserDto(null, "To be assigned", null));
                    }

                    Mono<PodData> podMono = (jobId != null
                            ? fetchLatestPod(jobId, authHeader)
                            : Mono.<PodData>empty())
                            .defaultIfEmpty(new PodData(null, jobId, null, null));

                    return Mono.zip(courierMono, podMono)
                            .map(cp -> {
                                UserDto courier = cp.getT1();
                                PodData pod = cp.getT2();

                                String pickupOtp = pod.pickupCode();
                                LotDto lotDto = lotEnv != null ? lotEnv.data() : null;

                                return new DonorOrderSummary(
                                        orderId,
                                        lotId,
                                        lotDto,
                                        items,
                                        receiver != null ? receiver.name() : null,
                                        jobId,
                                        courier != null ? courier.name() : "To be assigned",
                                        pickupOtp
                                );
                            });
                });
    }

    // ------------------------------------------------------------
    // RECEIVER: single compiled order view (NO pickup code)
    //
    // Flow:
    //  1) JOBS /api/v1/orders/{orderId}
    //  2) JOBS /api/v1/jobs/by-order/{orderId}
    //  3) LOTS /api/v1/lots/{lotId}, /lots/{lotId}/items
    //  4) AUTH /users/{donorId}, /users/{receiverId}, /users/{courierId}
    //  5) EVIDENCE /api/v1/pods/latest/{jobId} → deliveryCode only
    // ------------------------------------------------------------
    public Mono<ReceiverOrderDetails> getReceiverOrderDetails(String orderId, String authHeader) {
        String orderUrl = jobsBaseUrl + "/api/v1/orders/" + orderId;
        System.out.println("[BFF] GET " + orderUrl + " (receiver order)");

        Mono<OrderDetailsDto> orderMono = webClient.get()
                .uri(orderUrl)
                .headers(h -> {
                    if (authHeader != null) {
                        h.set(HttpHeaders.AUTHORIZATION, authHeader);
                    }
                })
                .retrieve()
                .bodyToMono(OrderDetailsDto.class);

        Mono<JobDto> jobMono = fetchJobByOrder(orderId, authHeader)
                .onErrorResume(ex -> {
                    System.out.println("[BFF] No job for order " + orderId + " or error: " + ex.getMessage());
                    return Mono.empty();
                })
                .defaultIfEmpty(new JobDto(null, orderId, null, null));

        return Mono.zip(orderMono, jobMono)
                .flatMap(tuple -> {
                    OrderDetailsDto order = tuple.getT1();
                    JobDto job = tuple.getT2();

                    String lotId = order.lotId();
                    String receiverId = order.receiverId();
                    String jobId = job.jobId();

                    Mono<LotEnvelope> lotMono = fetchLot(lotId, authHeader);
                    Mono<List<FoodItemDto>> itemsMono = fetchFoodItems(lotId, authHeader);

                    Mono<PodData> podMono = (jobId != null
                            ? fetchLatestPod(jobId, authHeader)
                            : Mono.<PodData>empty())
                            .defaultIfEmpty(new PodData(null, jobId, null, null));

                    return lotMono.flatMap(lotEnv -> {
                        LotDto lotDto = lotEnv != null ? lotEnv.data() : null;
                        String donorId = (lotDto != null) ? lotDto.getUserId() : null;

                        Mono<UserDto> donorMono = fetchUser(donorId, authHeader)
                                .defaultIfEmpty(new UserDto(donorId, null, null));

                        Mono<UserDto> receiverMono = fetchUser(receiverId, authHeader)
                                .defaultIfEmpty(new UserDto(receiverId, null, null));

                        Mono<UserDto> courierMono;
                        if (job.courierId() != null) {
                            courierMono = fetchUser(job.courierId(), authHeader)
                                    .defaultIfEmpty(new UserDto(job.courierId(), "To be assigned", null));
                        } else {
                            courierMono = Mono.just(new UserDto(null, "To be assigned", null));
                        }

                        return Mono.zip(
                                        itemsMono,
                                        donorMono,
                                        receiverMono,
                                        courierMono,
                                        podMono
                                )
                                .map(inner -> {
                                    List<FoodItemDto> items = inner.getT1();
                                    UserDto donor = inner.getT2();
                                    UserDto receiverUser = inner.getT3();
                                    UserDto courier = inner.getT4();
                                    PodData pod = inner.getT5();

                                    String deliveryOtp = pod.deliveryCode();

                                    return new ReceiverOrderDetails(
                                            order.id(),
                                            lotId,
                                            jobId,
                                            order.status(),
                                            lotDto,
                                            items,
                                            donor != null ? donor.name() : null,
                                            receiverUser != null ? receiverUser.name() : null,
                                            courier != null ? courier.name() : "To be assigned",
                                            deliveryOtp
                                    );
                                });
                    });
                });
    }

    // ------------------------------------------------------------
    // Helper HTTP calls
    // ------------------------------------------------------------

    private Mono<LotEnvelope> fetchLot(String lotId, String authHeader) {
        String lotUrl = lotsBaseUrl + "/api/v1/lots/" + lotId;
        System.out.println("[BFF] GET " + lotUrl);
        return webClient.get()
                .uri(lotUrl)
                .headers(h -> {
                    if (authHeader != null) {
                        h.set(HttpHeaders.AUTHORIZATION, authHeader);
                    }
                })
                .retrieve()
                .bodyToMono(LotEnvelope.class)
                .onErrorReturn(new LotEnvelope(false, null));
    }

    private Mono<List<FoodItemDto>> fetchFoodItems(String lotId, String authHeader) {
        String itemsUrl = lotsBaseUrl + "/api/v1/lots/" + lotId + "/items";
        System.out.println("[BFF] GET " + itemsUrl);
        return webClient.get()
                .uri(itemsUrl)
                .headers(h -> {
                    if (authHeader != null) {
                        h.set(HttpHeaders.AUTHORIZATION, authHeader);
                    }
                })
                .retrieve()
                .bodyToFlux(FoodItemDto.class)
                .collectList()
                .onErrorReturn(List.of());
    }

    private Mono<UserDto> fetchUser(String userId, String authHeader) {
        if (userId == null || "To be assigned".equalsIgnoreCase(userId)) {
            return Mono.empty();
        }
        String userUrl = authBaseUrl + "/api/v1/users/" + userId;
        System.out.println("[BFF] GET " + userUrl);
        return webClient.get()
                .uri(userUrl)
                .headers(h -> {
                    if (authHeader != null) {
                        h.set(HttpHeaders.AUTHORIZATION, authHeader);
                    }
                })
                .retrieve()
                .bodyToMono(UserEnvelope.class)
                .map(UserEnvelope::data)
                .onErrorResume(ex -> {
                    System.out.println("[BFF] Failed to fetch user " + userId + ": " + ex.getMessage());
                    return Mono.empty();
                });
    }

    private Mono<JobDto> fetchJobByOrder(String orderId, String authHeader) {
        // Jobs service: GET /api/v1/jobs/by-order/{orderId}
        String url = jobsBaseUrl + "/api/v1/jobs/by-order/" + orderId;
        System.out.println("[BFF] GET " + url + " (job by order)");
        return webClient.get()
                .uri(url)
                .headers(h -> {
                    if (authHeader != null) {
                        h.set(HttpHeaders.AUTHORIZATION, authHeader);
                    }
                })
                .retrieve()
                .bodyToMono(JobDto.class);
    }

    private Mono<PodData> fetchLatestPod(String jobId, String authHeader) {
        if (jobId == null) {
            return Mono.empty();
        }
        String url = evidenceBaseUrl + "/api/v1/pods/latest/" + jobId;
        System.out.println("[BFF] GET " + url + " (latest POD)");
        return webClient.get()
                .uri(url)
                .headers(h -> {
                    if (authHeader != null) {
                        h.set(HttpHeaders.AUTHORIZATION, authHeader);
                    }
                })
                .retrieve()
                .bodyToMono(PodEnvelope.class)
                .map(PodEnvelope::data)
                .onErrorResume(ex -> {
                    System.out.println("[BFF] Failed to fetch POD for job " + jobId + ": " + ex.getMessage());
                    return Mono.empty();
                });
    }

    // ------------------------------------------------------------
// DONOR: get pickup OTP by lotId
//
// Flow:
//   1) JOBS  /api/v1/orders/by-lot/{lotId}   → OrderDetailsDto
//   2) JOBS  /api/v1/jobs/by-order/{orderId} → JobDto
//   3) EVIDENCE /api/v1/pods/latest/{jobId}  → PodData.pickupCode
// ------------------------------------------------------------
    public Mono<PickupOtpResponse> getPickupOtpForLot(String lotId, String authHeader) {
        String orderUrl = jobsBaseUrl + "/api/v1/orders/by-lot/" + lotId;
        System.out.println("[BFF] GET " + orderUrl + " (pickup OTP by lot)");

        return webClient.get()
                .uri(orderUrl)
                .headers(h -> {
                    if (authHeader != null) {
                        h.set(HttpHeaders.AUTHORIZATION, authHeader);
                    }
                })
                .retrieve()
                .bodyToMono(OrderDetailsDto.class)
                .flatMap(order -> fetchJobByOrder(order.id(), authHeader))
                .flatMap(job -> fetchLatestPod(job.jobId(), authHeader))
                .map(pod -> new PickupOtpResponse(pod != null ? pod.pickupCode() : null))
                .switchIfEmpty(Mono.just(new PickupOtpResponse(null)));
    }

    // ------------------------------------------------------------
// RECEIVER: get delivery OTP by orderId
//
// Flow:
//   1) JOBS  /api/v1/jobs/by-order/{orderId} → JobDto
//   2) EVIDENCE /api/v1/pods/latest/{jobId}  → PodData.deliveryCode
// ------------------------------------------------------------
    public Mono<DeliveryOtpResponse> getDeliveryOtpForOrder(String orderId, String authHeader) {
        System.out.println("[BFF] Fetching delivery OTP for order " + orderId);

        return fetchJobByOrder(orderId, authHeader)
                .flatMap(job -> fetchLatestPod(job.jobId(), authHeader))
                .map(pod -> new DeliveryOtpResponse(pod != null ? pod.deliveryCode() : null))
                .switchIfEmpty(Mono.just(new DeliveryOtpResponse(null)));
    }

    public record PickupOtpResponse(String pickupOtp) {}
    public record DeliveryOtpResponse(String deliveryOtp) {}

    // ------------------------------------------------------------
    // DTOs for remote responses & UI payloads
    // ------------------------------------------------------------

    // Small row representing what we need from an order
    public record DonorOrderRow(
            String id,       // orderId
            String lotId,
            String receiverId
    ) {}

    // Details from jobs "order by id/by-lot" endpoints
    public record OrderDetailsDto(
            String id,
            String lotId,
            String receiverId,
            String deliveryAddressId,
            String pickupAddressId,
            String status
    ) {}

    // Job from jobs "by-order" endpoint
    public record JobDto(
            String jobId,
            String orderId,
            String courierId,
            String status
    ) {}

    // Envelope for POD latest response from evidence service
    public record PodEnvelope(
            boolean success,
            PodData data,
            String message
    ) {}

    // Minimal POD data you care about
    public record PodData(
            String id,
            String jobId,
            String pickupCode,
            String deliveryCode
    ) {}

    // ---- Auth service user envelope ----
    public record UserEnvelope(
            boolean success,
            UserDto data
    ) {}

    public record UserDto(
            String id,
            String name,
            String phoneNumber
    ) {}

    // ---- Lots service envelope (same shape you already use) ----
    public static class LotEnvelope {
        private boolean success;
        private LotDto data;
        public LotEnvelope() {}
        public LotEnvelope(boolean success, LotDto data) {
            this.success = success;
            this.data = data;
        }
        public boolean success() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public LotDto data() { return data; }
        public void setData(LotDto data) { this.data = data; }
    }

    public static class LotDto {
        private String lotId;
        private String userId;
        private String addressId;
        private String description;
        private String imageUrl;
        private String status;
        private String category;
        private int totalItems;

        public String getLotId() { return lotId; }
        public void setLotId(String lotId) { this.lotId = lotId; }

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }

        public String getAddressId() { return addressId; }
        public void setAddressId(String addressId) { this.addressId = addressId; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public int getTotalItems() { return totalItems; }
        public void setTotalItems(int totalItems) { this.totalItems = totalItems; }
    }

    // ---- UI payloads ----

    // Donor list + single view
    public record DonorOrderSummary(
            String orderId,
            String lotId,
            LotDto lot,
            List<FoodItemDto> foodItems,
            String receiverName,
            String jobId,
            String courierName,
            String pickupOtp
    ) {}

    // Receiver detailed view (NO pickupCode here)
    public record ReceiverOrderDetails(
            String orderId,
            String lotId,
            String jobId,
            String status,
            LotDto lot,
            List<FoodItemDto> foodItems,
            String donorName,
            String receiverName,
            String courierName,
            String deliveryOtp
    ) {}
}
