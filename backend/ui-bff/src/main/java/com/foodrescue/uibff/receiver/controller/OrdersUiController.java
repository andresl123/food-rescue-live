package com.foodrescue.uibff.receiver.controller;

import com.foodrescue.uibff.receiver.dto.orders.UiOrdersPayload;
import com.foodrescue.uibff.receiver.service.OrdersAggregationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/ui")
public class OrdersUiController {

    private final OrdersAggregationService ordersAggregationService;

    public OrdersUiController(OrdersAggregationService service) {
        this.ordersAggregationService = service;
    }

    @GetMapping("/orders")
    public Mono<ResponseEntity<UiOrdersPayload>> getOrders(
            @CookieValue(name = "access_token", required = false) String accessToken
    ) {
        final String authHeader = (accessToken != null)
                ? "Bearer " + accessToken
                : null;

        return ordersAggregationService.getAggregatedOrders(authHeader)
                .map(ResponseEntity::ok);
    }
}


