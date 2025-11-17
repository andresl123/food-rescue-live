package com.foodrescue.jobs.repository;

import com.foodrescue.jobs.entity.OrderDocument;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;
import java.time.Instant;
import reactor.core.publisher.Mono;

public interface OrderRepository extends ReactiveMongoRepository<OrderDocument, String> {
    Flux<OrderDocument> findTop5ByOrderByOrderDateDesc();
    Mono<Long> countByOrderDateAfter(Instant startOfDay);
    Mono<Long> countByStatusNotIgnoreCase(String status);
    Mono<Boolean> existsByReceiverIdAndStatusNotIgnoreCase(String receiverId, String status);
}