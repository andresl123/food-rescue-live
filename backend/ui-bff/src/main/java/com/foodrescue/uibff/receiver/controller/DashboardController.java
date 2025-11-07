package com.foodrescue.uibff.receiver.controller;


import com.foodrescue.uibff.receiver.dto.DashboardLot;
import com.foodrescue.uibff.receiver.dto.ReservationResponse;
import com.foodrescue.uibff.receiver.service.DashboardService;
import com.foodrescue.uibff.receiver.service.ReservationOrchestrationService;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.text.ParseException;
import java.util.List;

@RestController
@RequestMapping("/api/r_dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final ReservationOrchestrationService reservationService;

    // Inject the service
    public DashboardController(DashboardService dashboardService, ReservationOrchestrationService reservationOrchestrationService) {
        this.dashboardService = dashboardService;
        this.reservationService = reservationOrchestrationService;
    }

    /**
     * The single endpoint for the UI dashboard.
     * It orchestrates multiple downstream calls via the DashboardService.
     */
    @GetMapping("/dashboard")
    public Mono<ResponseEntity<List<DashboardLot>>> getDashboard(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size,
            @CookieValue(name = "access_token", required = false) String accessToken) {

        final String authHeader = (accessToken != null)
                ? "Bearer " + accessToken
                : null;

        return dashboardService.getAggregatedDashboard(page, size, authHeader)
                .map(dashboardList -> ResponseEntity.ok(dashboardList))
                .defaultIfEmpty(ResponseEntity.ok(List.of())); // Return an empty list if no lots found
    }

    @PostMapping("/reserve/{lotId}")
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ReservationResponse> reserveLot(@PathVariable String lotId,
                                                @CookieValue(name = "access_token", required = false) String accessToken) {

        if (accessToken == null || accessToken.isBlank()) {
            return Mono.error(new IllegalStateException("Missing access_token cookie"));
        }

        String userId = extractSub(accessToken);
        if (userId == null) {
            return Mono.error(new IllegalStateException("Unable to read sub from access_token"));
        }

        // pass both userId and token to service so it can set Authorization header
        return reservationService.reserveLot(userId, lotId, accessToken);
    }

    private String extractSub(String rawToken) {
        try {
            var jwt = SignedJWT.parse(rawToken);
            return jwt.getJWTClaimsSet().getSubject();
        } catch (ParseException e) {
            return null;
        }
    }
}