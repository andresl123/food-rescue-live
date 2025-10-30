package com.foodrescue.jobs.service;

import com.foodrescue.jobs.model.Job;
import com.foodrescue.jobs.model.Order;
import com.foodrescue.jobs.repository.JobRepository;
import com.foodrescue.jobs.repository.OrderRepository;
import com.foodrescue.jobs.web.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobs;
    private final OrderRepository orders;

    public Mono<ApiResponse<Job>> create(Job job) {
        job.setAssignedAt(job.getAssignedAt() == null ? LocalDate.now() : job.getAssignedAt());
        job.setCreatedAt(Instant.now());
        job.setUpdatedAt(Instant.now());
        return jobs.save(job)
                .flatMap(saved ->
                        // If job created, ensure related order is updated to assigned
                        orders.findById(saved.getOrderId())
                                .flatMap(o -> { o.setStatus("assigned"); o.setUpdatedAt(Instant.now()); return orders.save(o); })
                                .thenReturn(saved)
                )
                .map(ApiResponse::created)
                .onErrorReturn(ApiResponse.error("Failed to create job"));
    }

    public Mono<ApiResponse<Job>> getById(String id) {
        return jobs.findById(id).map(ApiResponse::ok)
                .switchIfEmpty(Mono.just(ApiResponse.error("Job not found")));
    }

    public Flux<Job> getByOrderId(String orderId) { return jobs.findByOrderId(orderId); }
    public Flux<Job> getByStatus(String status) { return jobs.findByStatus(status); }
    public Flux<Job> getByCourierId(String courierId) { return jobs.findByCourierId(courierId); }
    public Flux<Job> getByCourierIdAndStatus(String courierId, String status) { return jobs.findByCourierIdAndStatus(courierId, status); }

    public Mono<ApiResponse<Job>> updateStatus(String id, String status) {
        return jobs.findById(id)
                .flatMap(j -> {
                    j.setStatus(status);
                    j.setUpdatedAt(Instant.now());
                    if ("delivered".equalsIgnoreCase(status)) {
                        j.setCompletedAt(LocalDate.now());
                    }
                    return jobs.save(j);
                })
                .flatMap(saved ->
                        // propagate to order if delivered/cancelled
                        orders.findById(saved.getOrderId())
                                .flatMap(o -> {
                                    if ("delivered".equalsIgnoreCase(saved.getStatus())) o.setStatus("delivered");
                                    if ("cancelled".equalsIgnoreCase(saved.getStatus())) o.setStatus("cancelled");
                                    o.setUpdatedAt(Instant.now());
                                    return orders.save(o);
                                })
                                .thenReturn(saved)
                )
                .map(ApiResponse::ok)
                .switchIfEmpty(Mono.just(ApiResponse.error("Job not found")));
    }
}


