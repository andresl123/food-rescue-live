package com.foodrescue.evidence.repository;

import com.foodrescue.evidence.entity.POD;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface PODRepository extends ReactiveMongoRepository<POD, String> {
    @Query("{ 'job_id': ?0 }")
    Flux<POD> findByJobId(String jobId);
    
    @Query(value = "{ 'job_id': ?0 }", sort = "{ 'createdAt': -1 }")
    Mono<POD> findFirstByJobIdOrderByCreatedAtDesc(String jobId);
}
