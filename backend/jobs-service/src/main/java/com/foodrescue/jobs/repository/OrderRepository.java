package com.foodrescue.jobs.repository;


import com.foodrescue.jobs.entity.OrderDocument;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface OrderRepository extends ReactiveMongoRepository<OrderDocument, String> {
    Mono<Long> countByStatusNotIgnoreCase(String status);
    Mono<Boolean> existsByReceiverIdAndStatusNotIgnoreCase(String receiverId, String status);
    // NEW: used by OrderQueryService.getOrdersForReceiver
    Flux<OrderDocument> findByReceiverId(String receiverId);
    // NEW: used by BFF donor flow (get order from lotId)
    Mono<OrderDocument> findByLotId(String lotId);
}
