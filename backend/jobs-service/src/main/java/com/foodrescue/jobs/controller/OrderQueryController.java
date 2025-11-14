package com.foodrescue.jobs.controller;

import com.foodrescue.jobs.service.OrderQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
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

    @PutMapping("/{orderId}/delivered")
    public Mono<ResponseEntity<com.foodrescue.jobs.web.response.ApiResponse<OrderQueryService.OrderRow>>> markOrderAsDelivered(@PathVariable String orderId) {
        return orderQueryService.markOrderAsDelivered(orderId)
                .map(deliveredOrder -> {
                    OrderQueryService.OrderRow row = new OrderQueryService.OrderRow(
                            deliveredOrder.getId(),
                            deliveredOrder.getOrderDate() != null
                                    ? deliveredOrder.getOrderDate().toString()
                                    : null,
                            deliveredOrder.getStatus(),
                            deliveredOrder.getLotId(),
                            deliveredOrder.getPickupAddressId(),
                            deliveredOrder.getReceiverId(),
                            deliveredOrder.getDeliveryAddressId(),
                            "Delivered"
                    );
                    return ResponseEntity.ok(com.foodrescue.jobs.web.response.ApiResponse.ok(row));
                })
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
}

