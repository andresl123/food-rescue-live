package com.foodrescue.jobs.repository;

import com.foodrescue.jobs.model.Job;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;

public interface JobRepository extends ReactiveMongoRepository<Job, String> {
    Flux<Job> findByOrderId(String orderId);
    Flux<Job> findByStatus(String status);
    Flux<Job> findByCourierId(String courierId);
    Flux<Job> findByCourierIdAndStatus(String courierId, String status);
}


