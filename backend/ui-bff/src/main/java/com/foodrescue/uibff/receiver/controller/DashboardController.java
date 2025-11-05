package com.foodrescue.uibff.receiver.controller;


import com.foodrescue.uibff.receiver.dto.DashboardLot;
import com.foodrescue.uibff.receiver.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/api/r_dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    // Inject the service
    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
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
}