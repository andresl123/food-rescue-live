package com.foodrescue.evidence.service;

import com.foodrescue.evidence.entity.Order;
import com.foodrescue.evidence.repository.OrderRepository;
import com.foodrescue.evidence.web.request.OrderCreateRequest;
import com.foodrescue.evidence.web.response.ApiResponse;
import com.foodrescue.evidence.web.response.OrderResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final OrderRepository orderRepository;
    
    public Mono<ApiResponse<OrderResponse>> create(OrderCreateRequest request) {
        return Mono.just(Order.builder()
                .receiverId(request.receiverId())
                .orderDate(LocalDate.now())
                .status(request.status())
                .build())
                .flatMap(orderRepository::save)
                .map(this::toResponse)
                .map(ApiResponse::created)
                .onErrorReturn(ApiResponse.error("Failed to create order"));
    }
    
    public Mono<ApiResponse<OrderResponse>> getById(String id) {
        return orderRepository.findById(id)
                .map(this::toResponse)
                .map(ApiResponse::ok)
                .switchIfEmpty(Mono.just(ApiResponse.error("Order not found")));
    }
    
    public Mono<ApiResponse<OrderResponse>> getByReceiverIdAndStatus(String receiverId, String status) {
        return orderRepository.findByReceiverIdAndStatus(receiverId, status)
                .map(this::toResponse)
                .map(ApiResponse::ok)
                .switchIfEmpty(Mono.just(ApiResponse.error("Order not found")));
    }
    
    public Flux<OrderResponse> getByReceiverId(String receiverId) {
        return orderRepository.findByReceiverId(receiverId)
                .map(this::toResponse);
    }
    
    public Flux<OrderResponse> getByStatus(String status) {
        return orderRepository.findByStatus(status)
                .map(this::toResponse);
    }
    
    public Mono<ApiResponse<OrderResponse>> updateStatus(String id, String status) {
        return orderRepository.findById(id)
                .flatMap(order -> {
                    order.setStatus(status);
                    return orderRepository.save(order);
                })
                .map(this::toResponse)
                .map(ApiResponse::ok)
                .switchIfEmpty(Mono.just(ApiResponse.error("Order not found")));
    }
    
    public Mono<ApiResponse<Void>> delete(String id) {
        return orderRepository.existsById(id)
                .flatMap(exists -> {
                    if (exists) {
                        return orderRepository.deleteById(id)
                                .then(Mono.just(ApiResponse.ok(null)));
                    } else {
                        return Mono.just(ApiResponse.error("Order not found"));
                    }
                });
    }
    
    private OrderResponse toResponse(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getReceiverId(),
                order.getOrderDate(),
                order.getStatus(),
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
}
