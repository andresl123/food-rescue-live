package com.foodrescue.evidence.service;

import com.foodrescue.evidence.entity.Job;
import com.foodrescue.evidence.entity.POD;
import com.foodrescue.evidence.repository.JobRepository;
import com.foodrescue.evidence.repository.OrderRepository;
import com.foodrescue.evidence.repository.PODRepository;
import com.foodrescue.evidence.web.request.PODCreateRequest;
import com.foodrescue.evidence.web.request.VerificationRequest;
import com.foodrescue.evidence.web.response.ApiResponse;
import com.foodrescue.evidence.web.response.PODResponse;
import com.foodrescue.evidence.web.response.VerificationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class PODService {
    
    private final PODRepository podRepository;
    private final JobRepository jobRepository;
    private final OrderRepository orderRepository;
    
    public Mono<ApiResponse<PODResponse>> create(PODCreateRequest request) {
        return podRepository.save(POD.builder()
                .jobId(request.jobId())
                .otp(request.otp())
                .build())
                .map(this::toResponse)
                .map(ApiResponse::created)
                .onErrorReturn(ApiResponse.error("Failed to create POD"));
    }
    
    public Mono<ApiResponse<PODResponse>> getById(String id) {
        return podRepository.findById(id)
                .map(this::toResponse)
                .map(ApiResponse::ok)
                .switchIfEmpty(Mono.just(ApiResponse.error("POD not found")));
    }
    
    public Flux<PODResponse> getByJobId(String jobId) {
        return podRepository.findByJobId(jobId)
                .map(this::toResponse);
    }
    
    public Mono<ApiResponse<VerificationResponse>> verify(VerificationRequest request) {
        // Find POD by jobId and OTP
        return podRepository.findByJobIdAndOtp(request.jobId(), request.verificationCode())
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Invalid OTP or Job ID")))
                .flatMap(pod -> {
                    // Update job status to completed
                    return jobRepository.findById(request.jobId())
                            .flatMap(job -> {
                                job.setStatus("completed");
                                job.setCompletedAt(LocalDate.now());
                                return jobRepository.save(job);
                            })
                            .then(jobRepository.findById(request.jobId()))
                            .flatMap(job -> orderRepository.findById(job.getOrderId())
                                    .map(order -> new VerificationResponse(
                                            true,
                                            "Verification successful",
                                            order.getReceiverId(),
                                            null, // No recipient name in simplified schema
                                            null  // No delivery address in simplified schema
                                    )));
                })
                .map(ApiResponse::ok)
                .onErrorReturn(ApiResponse.error("Verification failed"));
    }
    
    
    public Mono<ApiResponse<Void>> delete(String id) {
        return podRepository.existsById(id)
                .flatMap(exists -> {
                    if (exists) {
                        return podRepository.deleteById(id)
                                .then(Mono.just(ApiResponse.ok(null)));
                    } else {
                        return Mono.just(ApiResponse.error("POD not found"));
                    }
                });
    }
    
    private PODResponse toResponse(POD pod) {
        return new PODResponse(
                pod.getId(),
                pod.getJobId(),
                pod.getOtp(),
                pod.getCreatedAt(),
                pod.getUpdatedAt()
        );
    }
}
