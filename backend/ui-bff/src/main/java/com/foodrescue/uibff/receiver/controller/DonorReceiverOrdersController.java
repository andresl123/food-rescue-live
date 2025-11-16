package com.foodrescue.uibff.receiver.controller;

import com.foodrescue.uibff.receiver.service.DonorReceiverOrdersService;
import com.foodrescue.uibff.receiver.service.DonorReceiverOrdersService.DonorOrderSummary;
import com.foodrescue.uibff.receiver.service.DonorReceiverOrdersService.ReceiverOrderDetails;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.text.ParseException;
import java.util.List;

@RestController
@RequestMapping("/api")
public class DonorReceiverOrdersController {

    private final DonorReceiverOrdersService service;

    public DonorReceiverOrdersController(DonorReceiverOrdersService service) {
        this.service = service;
    }

    // ------------------------------------------------------------
    // GET /api/donor/orders/{donorId}
    // Uses access_token cookie to build Authorization header
    // ------------------------------------------------------------
    @GetMapping(path = "/donor/orders/{donorId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<List<DonorOrderSummary>> getDonorOrders(
            @PathVariable String donorId,
            @CookieValue(name = "access_token", required = false) String accessToken
    ) {
        final String authHeader = (accessToken != null)
                ? "Bearer " + accessToken
                : null;

        return service.getDonorOrders(donorId, authHeader);
    }

    // ------------------------------------------------------------
    // GET /api/donor/orders/by-lot/{lotId}
    // donorId is taken from JWT in access_token cookie
    // ------------------------------------------------------------
    @GetMapping(path = "/donor/orders/by-lot/{lotId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<DonorOrderSummary> getDonorOrderByLot(
            @PathVariable String lotId,
            @CookieValue(name = "access_token", required = false) String accessToken
    ) {
        final String authHeader = (accessToken != null)
                ? "Bearer " + accessToken
                : null;

        final String donorId = extractUserIdFromToken(accessToken);

        return service.getDonorOrderByLot(lotId, donorId, authHeader);
    }

    // ------------------------------------------------------------
    // GET /api/receiver/orders/{orderId}
    // returns compiled object with order + job + lot + items + deliveryOtp
    // ------------------------------------------------------------
    @GetMapping(path = "/receiver/orders/{orderId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ReceiverOrderDetails> getReceiverOrder(
            @PathVariable String orderId,
            @CookieValue(name = "access_token", required = false) String accessToken
    ) {
        final String authHeader = (accessToken != null)
                ? "Bearer " + accessToken
                : null;

        return service.getReceiverOrderDetails(orderId, authHeader);
    }

    // ------------------------------------------------------------
    // Helper: extract user id (donorId) from JWT in access_token cookie
    // ------------------------------------------------------------
    private String extractUserIdFromToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return null;
        }
        try {
            var jwt = SignedJWT.parse(rawToken);
            return jwt.getJWTClaimsSet().getSubject();
        } catch (ParseException e) {
            return null;
        }
    }

    // ------------------------------------------------------------
// GET /api/donor/otp/pickup/{lotId}
// Donor sends lotId → returns pickup OTP
// ------------------------------------------------------------
    @GetMapping(path = "/donor/otp/pickup/{lotId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<DonorReceiverOrdersService.PickupOtpResponse> getPickupOtpForLot(
            @PathVariable String lotId,
            @CookieValue(name = "access_token", required = false) String accessToken
    ) {
        final String authHeader = (accessToken != null)
                ? "Bearer " + accessToken
                : null;

        return service.getPickupOtpForLot(lotId, authHeader);
    }

    // ------------------------------------------------------------
// GET /api/receiver/otp/delivery/{orderId}
// Receiver sends orderId → returns delivery OTP
// ------------------------------------------------------------
    @GetMapping(path = "/receiver/otp/delivery/{orderId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<DonorReceiverOrdersService.DeliveryOtpResponse> getDeliveryOtpForOrder(
            @PathVariable String orderId,
            @CookieValue(name = "access_token", required = false) String accessToken
    ) {
        final String authHeader = (accessToken != null)
                ? "Bearer " + accessToken
                : null;

        return service.getDeliveryOtpForOrder(orderId, authHeader);
    }
}
