package com.foodrescue.evidence.repository;

import com.foodrescue.evidence.entity.Order;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface OrderRepository extends ReactiveMongoRepository<Order, String> {
    Flux<Order> findByReceiverId(String receiverId);
    Flux<Order> findByStatus(String status);
    Mono<Order> findByReceiverIdAndStatus(String receiverId, String status);
    Mono<Boolean> existsByReceiverId(String receiverId);
}
