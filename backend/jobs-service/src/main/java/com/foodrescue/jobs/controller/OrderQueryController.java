package com.foodrescue.jobs.controller;

import com.foodrescue.jobs.entity.OrderDocument;
import com.foodrescue.jobs.service.OrderQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderQueryController {

    private final OrderQueryService orderQueryService;

    // ------------------------------------------------------------
    // only receiver should see their own orders
    // GET /api/v1/orders/mine
    // ------------------------------------------------------------
    @GetMapping("/mine")
    public Mono<OrderQueryService.OrdersPage> myOrders(JwtAuthenticationToken auth) {
        // in your other controller you used token.getSubject() as receiverId
        String receiverId = auth.getToken().getSubject();
        return orderQueryService.getOrdersForReceiver(receiverId);
    }

    // ------------------------------------------------------------
    // GET /api/v1/orders/{orderId}
    // Used by BFF receiver endpoint: /api/receiver/orders/{orderId}
    // ------------------------------------------------------------
    @GetMapping("/{orderId}")
    public Mono<OrderDocument> getOrderById(@PathVariable String orderId) {
        return orderQueryService.getOrderById(orderId);
    }

    // ------------------------------------------------------------
    // GET /api/v1/orders/by-lot/{lotId}
    // Used by BFF donor endpoint: /api/donor/orders/by-lot/{lotId}
    // ------------------------------------------------------------
    @GetMapping("/by-lot/{lotId}")
    public Mono<OrderDocument> getOrderByLotId(@PathVariable String lotId) {
        return orderQueryService.getOrderByLotId(lotId);
    }
}
