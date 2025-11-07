package com.foodrescue.uibff.receiver.service;

import com.foodrescue.uibff.receiver.dto.DefaultAddressResponse;
import com.foodrescue.uibff.receiver.dto.LotDetailsResponse;
import com.foodrescue.uibff.receiver.dto.ReservationCreateRequest;
import com.foodrescue.uibff.receiver.dto.ReservationResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class ReservationOrchestrationService {

    private final WebClient webClient;

    @Value("${services.auth.base-url}")
    private String authBaseUrl;         // http://localhost:8080

    @Value("${services.lots.base-url}")
    private String lotsBaseUrl;         // http://localhost:8081

    @Value("${services.jobs.base-url}")
    private String reservationsBaseUrl; // http://localhost:8082

    public ReservationOrchestrationService(WebClient webClient) {
        this.webClient = webClient;
    }

    public Mono<ReservationResponse> reserveLot(String userId,
                                                String lotId,
                                                String accessToken) {

        String bearer = "Bearer " + accessToken;

        // 1) get user's default address
        Mono<DefaultAddressResponse> defaultAddrMono = webClient.get()
                .uri(authBaseUrl + "/api/v1/users/{userId}/default-address", userId)
                .headers(h -> h.set("Authorization", bearer))
                .retrieve()
                .bodyToMono(DefaultAddressResponse.class);

        // 2) get lot to read pickup address
        Mono<LotDetailsResponse> lotMono = webClient.get()
                .uri(lotsBaseUrl + "/api/v1/lots/{lotId}", lotId)
                .headers(h -> h.set("Authorization", bearer))
                .retrieve()
                .bodyToMono(LotDetailsResponse.class);

        // 3) combine and call reservation service
        return Mono.zip(defaultAddrMono, lotMono)
                .flatMap(tuple -> {
                    DefaultAddressResponse addr = tuple.getT1();
                    LotDetailsResponse lotResp = tuple.getT2();

                    String deliveryAddressId = addr.getDefaultAddressId();
                    String pickupAddressId = (lotResp.getData() != null)
                            ? lotResp.getData().getAddressId()
                            : null;

                    ReservationCreateRequest req = new ReservationCreateRequest(
                            lotId,
                            deliveryAddressId,
                            pickupAddressId
                    );

                    // call 8082 to create order + job + pod
                    return webClient.post()
                            .uri(reservationsBaseUrl + "/api/v1/reservations")
                            .headers(h -> h.set("Authorization", bearer))
                            .bodyValue(req)
                            .retrieve()
                            .bodyToMono(ReservationResponse.class);
                })
                // 4) AFTER reservation is created, update lot status to RESERVED
                .flatMap(reservationResponse ->
                        webClient.patch()
                                .uri(lotsBaseUrl + "/api/v1/lots/{lotId}/status", lotId)
                                .headers(h -> h.set("Authorization", bearer))
                                .bodyValue(new LotStatusUpdate("PENDING"))
                                .retrieve()
                                .bodyToMono(Void.class)
                                // ignore the body, just return original reservation
                                .thenReturn(reservationResponse)
                );
    }

    // small inner DTO for PATCH body
    private record LotStatusUpdate(String status) {}
}
