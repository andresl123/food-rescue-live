package com.foodrescue.evidence.repository;

import com.foodrescue.evidence.entity.POD;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface PODRepository extends ReactiveMongoRepository<POD, String> {
    Flux<POD> findByJobId(String jobId);
    Mono<POD> findFirstByJobIdOrderByCreatedAtDesc(String jobId);
}
