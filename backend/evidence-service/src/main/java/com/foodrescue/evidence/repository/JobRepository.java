package com.foodrescue.evidence.repository;

import com.foodrescue.evidence.entity.Job;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface JobRepository extends ReactiveMongoRepository<Job, String> {
    Flux<Job> findByCourierId(String courierId);
    Flux<Job> findByOrderId(String orderId);
    Flux<Job> findByStatus(String status);
    Flux<Job> findByCourierIdAndStatus(String courierId, String status);
    Flux<Job> findByOrderIdAndStatus(String orderId, String status);
    Mono<Boolean> existsByCourierId(String courierId);
}
