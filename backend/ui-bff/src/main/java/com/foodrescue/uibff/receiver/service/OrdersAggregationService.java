package com.foodrescue.uibff.receiver.service;

import com.foodrescue.uibff.receiver.dto.orders.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class OrdersAggregationService {

    private final WebClient webClient;

    @Value("${services.jobs.base-url}")
    private String jobsBaseUrl;

    @Value("${services.lots.base-url}")
    private String lotsBaseUrl;

    @Value("${services.auth.base-url}")
    private String authBaseUrl;

    private static final DateTimeFormatter UI_FMT =
            DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a");

    public OrdersAggregationService(WebClient.Builder builder) {
        this.webClient = builder.build();
    }

    public Mono<UiOrdersPayload> getAggregatedOrders(String authHeader) {

        if (!StringUtils.hasText(authHeader)) {
            System.out.println("[BFF] No auth header, returning empty orders");
            return Mono.just(new UiOrdersPayload(List.of(), List.of()));
        }

        String ordersUrl = jobsBaseUrl + "/api/v1/orders/mine";
        System.out.println("[BFF] GET " + ordersUrl);

        return webClient.get()
                .uri(ordersUrl)
                .headers(h -> h.set(HttpHeaders.AUTHORIZATION, authHeader))
                .retrieve()
                .bodyToMono(JobOrdersResponse.class)
                .doOnNext(resp -> {
                    System.out.println("[BFF] /orders/mine -> current=" + resp.current().size()
                            + ", completed=" + resp.completed().size());
                })
                .flatMap(flat -> {
                    Mono<List<UiOrder>> currentMono = Flux.fromIterable(flat.current())
                            .flatMap(order -> fetchDetailsAndAggregate(order, authHeader))
                            .collectList();

                    Mono<List<UiOrder>> completedMono = Flux.fromIterable(flat.completed())
                            .flatMap(order -> fetchDetailsAndAggregate(order, authHeader))
                            .collectList();

                    return Mono.zip(currentMono, completedMono, UiOrdersPayload::new);
                });
    }

    private Mono<UiOrder> fetchDetailsAndAggregate(JobOrderRow order, String authHeader) {

        final String lotId = order.lot_id();  // 👈 we'll forward this to UI
        final String lotUrl = lotsBaseUrl + "/api/v1/lots/" + lotId;
        final String lotItemsUrl = lotsBaseUrl + "/api/v1/lots/" + lotId + "/items";

        System.out.println("\n[BFF] ==== aggregating order " + order.id() + " (lot=" + lotId + ") ====");

        Mono<LotEnvelope> lotEnvMono = webClient.get()
                .uri(lotUrl)
                .headers(h -> h.set(HttpHeaders.AUTHORIZATION, authHeader))
                .retrieve()
                .bodyToMono(LotEnvelope.class)
                .doOnNext(env -> {
                    var d = env.data();
                    System.out.println("[BFF] GET " + lotUrl + " -> success=" + env.success()
                            + ", lotId=" + (d != null ? d.getLotId() : null)
                            + ", userId(donor?)=" + (d != null ? d.getUserId() : null));
                })
                .onErrorReturn(new LotEnvelope(false, null));

        Mono<List<FoodItemDto>> itemsMono = webClient.get()
                .uri(lotItemsUrl)
                .headers(h -> h.set(HttpHeaders.AUTHORIZATION, authHeader))
                .retrieve()
                .bodyToFlux(FoodItemDto.class)
                .doOnNext(item -> System.out.println("[BFF] GET " + lotItemsUrl + " -> item=" + item.getItemName()))
                .collectList()
                .doOnNext(list -> System.out.println("[BFF] items count for lot " + lotId + " = " + list.size()))
                .onErrorReturn(List.of());

        String donorAddrUrl = authBaseUrl + "/api/v1/addresses/" + order.donor_address();
        Mono<AddressEnvelope> donorAddrMono = webClient.get()
                .uri(donorAddrUrl)
                .headers(h -> h.set(HttpHeaders.AUTHORIZATION, authHeader))
                .retrieve()
                .bodyToMono(AddressEnvelope.class)
                .doOnNext(a -> System.out.println("[BFF] GET " + donorAddrUrl + " -> success=" + a.success()))
                .onErrorReturn(new AddressEnvelope(false, null));

        String recipientUserUrl = authBaseUrl + "/api/v1/users/" + order.receiver_id();
        Mono<UserEnvelope> recipientUserMono = webClient.get()
                .uri(recipientUserUrl)
                .headers(h -> h.set(HttpHeaders.AUTHORIZATION, authHeader))
                .retrieve()
                .bodyToMono(UserEnvelope.class)
                .doOnNext(u -> System.out.println("[BFF] GET " + recipientUserUrl + " -> name=" + (u.data() != null ? u.data().name() : "null")))
                .onErrorReturn(new UserEnvelope(false, null));

        String recipientAddrUrl = authBaseUrl + "/api/v1/addresses/" + order.recipient_address();
        Mono<AddressEnvelope> recipientAddrMono = webClient.get()
                .uri(recipientAddrUrl)
                .headers(h -> h.set(HttpHeaders.AUTHORIZATION, authHeader))
                .retrieve()
                .bodyToMono(AddressEnvelope.class)
                .doOnNext(a -> System.out.println("[BFF] GET " + recipientAddrUrl + " -> success=" + a.success()))
                .onErrorReturn(new AddressEnvelope(false, null));

        Mono<UserEnvelope> courierMono;
        if ("To be assigned".equalsIgnoreCase(order.courier_id())) {
            System.out.println("[BFF] courier is 'To be assigned' in job response");
            courierMono = Mono.just(new UserEnvelope(false, null));
        } else {
            String courierUrl = authBaseUrl + "/api/v1/users/" + order.courier_id();
            courierMono = webClient.get()
                    .uri(courierUrl)
                    .headers(h -> h.set(HttpHeaders.AUTHORIZATION, authHeader))
                    .retrieve()
                    .bodyToMono(UserEnvelope.class)
                    .doOnNext(u -> System.out.println("[BFF] GET " + courierUrl + " -> name=" + (u.data() != null ? u.data().name() : "null")))
                    .onErrorReturn(new UserEnvelope(false, null));
        }

        return lotEnvMono.flatMap(lotEnv -> {
            LotDto lotDto = lotEnv.data();
            String donorUserId = (lotDto != null) ? lotDto.getUserId() : null;

            Mono<UserEnvelope> donorUserMono;
            if (donorUserId != null) {
                String donorUserUrl = authBaseUrl + "/api/v1/users/" + donorUserId;
                donorUserMono = webClient.get()
                        .uri(donorUserUrl)
                        .headers(h -> h.set(HttpHeaders.AUTHORIZATION, authHeader))
                        .retrieve()
                        .bodyToMono(UserEnvelope.class)
                        .doOnNext(u -> System.out.println("[BFF] GET " + donorUserUrl + " -> donorName=" + (u.data() != null ? u.data().name() : "null")))
                        .onErrorReturn(new UserEnvelope(false, null));
            } else {
                System.out.println("[BFF] lot did NOT have userId/donorId, using fallback name 'Donor'");
                donorUserMono = Mono.just(new UserEnvelope(false, null));
            }

            return Mono.zip(
                    itemsMono,
                    donorAddrMono,
                    recipientUserMono,
                    recipientAddrMono,
                    courierMono,
                    donorUserMono
            ).map(tuple -> {
                List<FoodItemDto> items = tuple.getT1();
                AddressDto donorAddr = tuple.getT2().data();
                UserDto recipientUser = tuple.getT3().data();
                AddressDto recipientAddr = tuple.getT4().data();
                UserDto courierUser = tuple.getT5().data();
                UserDto donorUser = tuple.getT6().data();

                UiParty donor = new UiParty(
                        donorUser != null && donorUser.name() != null ? donorUser.name() : "Donor",
                        donorAddr != null ? toAddressString(donorAddr) : order.donor_address()
                );

                UiParty recipient = new UiParty(
                        recipientUser != null && recipientUser.name() != null ? recipientUser.name() : "Recipient",
                        recipientAddr != null ? toAddressString(recipientAddr) : order.recipient_address()
                );

                List<UiItem> uiItems = items.stream()
                        .map(i -> new UiItem(i.getItemName(), i.getQuantity(), i.getUnitOfMeasure()))
                        .toList();

                UiCourier courier = (courierUser == null)
                        ? new UiCourier("To be assigned", "To be assigned")
                        : new UiCourier(
                        courierUser.name() != null ? courierUser.name() : "To be assigned",
                        courierUser.phoneNumber() != null ? courierUser.phoneNumber() : "To be assigned"
                );

                System.out.println("[BFF] Built UiOrder for order=" + order.id());

                // 👇 ADDED lotId HERE
                return new UiOrder(
                        order.id(),
                        formatUiDate(order.date()),
                        mapStatus(order.status()),
                        donor,
                        recipient,
                        uiItems,
                        courier,
                        lotId              // <--- NEW FIELD
                );
            });
        });
    }

    private String formatUiDate(String iso) {
        try {
            return OffsetDateTime.parse(iso).format(UI_FMT);
        } catch (Exception e) {
            return iso;
        }
    }

    private String mapStatus(String status) {
        if ("CREATED".equalsIgnoreCase(status)) return "READY";
        return status;
    }

    private String toAddressString(AddressDto a) {
        StringBuilder sb = new StringBuilder();
        if (a.street() != null) sb.append(a.street());
        if (a.city() != null) sb.append(", ").append(a.city());
        if (a.state() != null) sb.append(", ").append(a.state());
        if (a.postalCode() != null) sb.append(", ").append(a.postalCode());
        if (a.country() != null) sb.append(", ").append(a.country());
        return sb.toString();
    }

    // envelope coming from lot service
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

    // actual lot structure inside "data"
    public static class LotDto {
        private String lotId;
        private String userId;
        private String addressId;
        public String getLotId() { return lotId; }
        public void setLotId(String lotId) { this.lotId = lotId; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getAddressId() { return addressId; }
        public void setAddressId(String addressId) { this.addressId = addressId; }
    }
}
