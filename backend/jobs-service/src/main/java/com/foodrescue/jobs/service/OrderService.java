package com.foodrescue.jobs.service;

import com.foodrescue.jobs.model.Order;
import com.foodrescue.jobs.repository.OrderRepository;
import com.foodrescue.jobs.web.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orders;

    public Mono<ApiResponse<Order>> create(Order order) {
        order.setCreatedAt(Instant.now());
        order.setUpdatedAt(Instant.now());
        return orders.save(order).map(ApiResponse::created)
                .onErrorReturn(ApiResponse.error("Failed to create order"));
    }

    public Mono<ApiResponse<Order>> getById(String id) {
        return orders.findById(id).map(ApiResponse::ok)
                .switchIfEmpty(Mono.just(ApiResponse.error("Order not found")));
    }

    public Flux<Order> getByReceiverId(String receiverId) {
        return orders.findByReceiverId(receiverId);
    }

    public Flux<Order> getByStatus(String status) {
        return orders.findByStatus(status);
    }

    public Mono<ApiResponse<Order>> updateStatus(String id, String status) {
        return orders.findById(id)
                .flatMap(o -> { o.setStatus(status); o.setUpdatedAt(Instant.now()); return orders.save(o); })
                .map(ApiResponse::ok)
                .switchIfEmpty(Mono.just(ApiResponse.error("Order not found")));
    }

    public Mono<ApiResponse<Void>> delete(String id) {
        return orders.deleteById(id).thenReturn(ApiResponse.ok(null));
    }
}


