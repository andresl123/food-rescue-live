package com.foodrescue.jobs.service;

import com.foodrescue.jobs.model.Job;
import com.foodrescue.jobs.repository.JobRepository;
import com.foodrescue.jobs.web.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobs;

    /**
     * Generates a unique job ID
     */
    private String generateJobId() {
        return "JOB-" + System.currentTimeMillis();
    }

    public Mono<ApiResponse<Job>> create(Job job) {
        // Auto-generate jobId if not provided
        if (job.getJobId() == null || job.getJobId().trim().isEmpty()) {
            job.setJobId(generateJobId());
        }
        job.setAssignedAt(job.getAssignedAt() == null ? Instant.now() : job.getAssignedAt());
        return jobs.save(job)
                .map(ApiResponse::created)
                .onErrorReturn(ApiResponse.error("Failed to create job"));
    }

    public Mono<ApiResponse<Job>> createFromOrderId(String orderId) {
        Job job = new Job();
        job.setJobId(generateJobId()); // Auto-generate unique job ID
        job.setOrderId(orderId);
        job.setStatus_1("pending"); // Default status for pickup
        job.setStatus_2("pending"); // Default status for delivery
        job.setAssignedAt(Instant.now());
        
        return jobs.save(job)
                .map(ApiResponse::created)
                .onErrorReturn(ApiResponse.error("Failed to create job from order ID"));
    }

    public Mono<ApiResponse<Job>> getById(String id) {
        return jobs.findById(id).map(ApiResponse::ok)
                .switchIfEmpty(Mono.just(ApiResponse.error("Job not found")));
    }

    public Flux<Job> getAllJobs() {
        return jobs.findAll();
    }

    public Flux<Job> getByOrderId(String orderId) { return jobs.findByOrderId(orderId); }
    public Flux<Job> getByStatus1(String status1) { return jobs.findByStatus_1(status1); }
    public Flux<Job> getByStatus2(String status2) { return jobs.findByStatus_2(status2); }
    public Flux<Job> getByCourierId(String courierId) { return jobs.findByCourierId(courierId); }
    public Flux<Job> getByCourierIdAndStatus1(String courierId, String status1) { return jobs.findByCourierIdAndStatus_1(courierId, status1); }
    public Flux<Job> getByCourierIdAndStatus2(String courierId, String status2) { return jobs.findByCourierIdAndStatus_2(courierId, status2); }

    public Mono<ApiResponse<Job>> updateStatus1(String id, String status1) {
        return jobs.findById(id)
                .flatMap(j -> {
                    j.setStatus_1(status1);
                    j.setUpdatedAt(Instant.now());
                    return jobs.save(j);
                })
                .map(ApiResponse::ok)
                .switchIfEmpty(Mono.just(ApiResponse.error("Job not found")));
    }

    public Mono<ApiResponse<Job>> updateStatus2(String id, String status2) {
        return jobs.findById(id)
                .flatMap(j -> {
                    j.setStatus_2(status2);
                    j.setUpdatedAt(Instant.now());
                    if ("completed".equalsIgnoreCase(status2)) {
                        j.setCompletedAt(Instant.now());
                    }
                    return jobs.save(j);
                })
                .map(ApiResponse::ok)
                .switchIfEmpty(Mono.just(ApiResponse.error("Job not found")));
    }

    public Mono<ApiResponse<Job>> assignCourier(String jobId, String courierId) {
        return jobs.findById(jobId)
                .flatMap(job -> {
                    job.setCourierId(courierId);
                    job.setUpdatedAt(Instant.now());
                    // If assignedAt is null, set it to now (first time assignment)
                    if (job.getAssignedAt() == null) {
                        job.setAssignedAt(Instant.now());
                    }
                    return jobs.save(job);
                })
                .map(ApiResponse::ok)
                .switchIfEmpty(Mono.just(ApiResponse.error("Job not found")));
    }
}


