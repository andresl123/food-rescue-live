package com.foodrescue.jobs.repository;

import com.foodrescue.jobs.entity.JobDocument;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Mono;

public interface JobRepository extends ReactiveMongoRepository<JobDocument, String> {
    Mono<JobDocument> findByOrderId(String orderId);
}
