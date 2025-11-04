package com.foodrescue.jobs.repository;

import com.foodrescue.jobs.model.Job;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;

public interface JobRepository extends ReactiveMongoRepository<Job, String> {
    Flux<Job> findByOrderId(String orderId);
    
    @Query("{ 'status_1': ?0 }")
    Flux<Job> findByStatus_1(String status1);
    
    @Query("{ 'status_2': ?0 }")
    Flux<Job> findByStatus_2(String status2);
    
    Flux<Job> findByCourierId(String courierId);
    
    @Query("{ 'courierId': ?0, 'status_1': ?1 }")
    Flux<Job> findByCourierIdAndStatus_1(String courierId, String status1);
    
    @Query("{ 'courierId': ?0, 'status_2': ?1 }")
    Flux<Job> findByCourierIdAndStatus_2(String courierId, String status2);
    
    // Find jobs where courierId is null or doesn't exist (available jobs)
    // Using explicit query to handle both null and missing fields
    @Query("{ $or: [ { 'courierId': null }, { 'courierId': { $exists: false } } ] }")
    Flux<Job> findAvailableJobs();
}


