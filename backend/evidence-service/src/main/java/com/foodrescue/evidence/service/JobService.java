package com.foodrescue.evidence.service;

import com.foodrescue.evidence.entity.Job;
import com.foodrescue.evidence.repository.JobRepository;
import com.foodrescue.evidence.web.request.JobCreateRequest;
import com.foodrescue.evidence.web.response.ApiResponse;
import com.foodrescue.evidence.web.response.JobResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JobService {
    
    private final JobRepository jobRepository;
    
    public Mono<ApiResponse<JobResponse>> create(JobCreateRequest request) {
        return Mono.just(Job.builder()
                .courierId(request.courierId())
                .orderId(request.orderId())
                .status(request.status())
                .assignedAt(LocalDate.now())
                .notes(request.notes())
                .build())
                .flatMap(jobRepository::save)
                .map(this::toResponse)
                .map(ApiResponse::created)
                .onErrorReturn(ApiResponse.error("Failed to create job"));
    }
    
    public Mono<ApiResponse<JobResponse>> getById(String id) {
        return jobRepository.findById(id)
                .map(this::toResponse)
                .map(ApiResponse::ok)
                .switchIfEmpty(Mono.just(ApiResponse.error("Job not found")));
    }
    
    public Flux<JobResponse> getByOrderIdAndStatus(String orderId, String status) {
        return jobRepository.findByOrderIdAndStatus(orderId, status)
                .map(this::toResponse);
    }
    
    public Flux<JobResponse> getByCourierId(String courierId) {
        return jobRepository.findByCourierId(courierId)
                .map(this::toResponse);
    }
    
    public Flux<JobResponse> getByOrderId(String orderId) {
        return jobRepository.findByOrderId(orderId)
                .map(this::toResponse);
    }
    
    public Flux<JobResponse> getByStatus(String status) {
        return jobRepository.findByStatus(status)
                .map(this::toResponse);
    }
    
    public Flux<JobResponse> getByCourierIdAndStatus(String courierId, String status) {
        return jobRepository.findByCourierIdAndStatus(courierId, status)
                .map(this::toResponse);
    }
    
    public Mono<ApiResponse<JobResponse>> updateStatus(String id, String status) {
        return jobRepository.findById(id)
                .flatMap(job -> {
                    job.setStatus(status);
                    if ("completed".equals(status)) {
                        job.setCompletedAt(LocalDate.now());
                    }
                    return jobRepository.save(job);
                })
                .map(this::toResponse)
                .map(ApiResponse::ok)
                .switchIfEmpty(Mono.just(ApiResponse.error("Job not found")));
    }
    
    public Mono<ApiResponse<Void>> delete(String id) {
        return jobRepository.existsById(id)
                .flatMap(exists -> {
                    if (exists) {
                        return jobRepository.deleteById(id)
                                .then(Mono.just(ApiResponse.ok(null)));
                    } else {
                        return Mono.just(ApiResponse.error("Job not found"));
                    }
                });
    }
    
    private JobResponse toResponse(Job job) {
        return new JobResponse(
                job.getId(),
                job.getCourierId(),
                job.getOrderId(),
                job.getStatus(),
                job.getAssignedAt(),
                job.getCompletedAt(),
                job.getNotes(),
                job.getCreatedAt(),
                job.getUpdatedAt()
        );
    }
}
