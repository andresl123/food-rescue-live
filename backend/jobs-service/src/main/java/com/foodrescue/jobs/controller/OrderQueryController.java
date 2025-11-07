package com.foodrescue.jobs.controller;

import com.foodrescue.jobs.service.OrderQueryService;
import com.foodrescue.security.contracts.RBAC;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderQueryController {

    private final OrderQueryService orderQueryService;

    // only receiver should see their own orders
    @GetMapping("/mine")
    public Mono<OrderQueryService.OrdersPage> myOrders(JwtAuthenticationToken auth) {
        // in your other controller you used token.getSubject() as receiverId
        String receiverId = auth.getToken().getSubject();
        return orderQueryService.getOrdersForReceiver(receiverId);
    }
}

