package com.foodrescue.evidence.service;

import com.foodrescue.evidence.entity.POD;
import com.foodrescue.evidence.repository.PODRepository;
import com.foodrescue.evidence.web.response.ApiResponse;
import com.foodrescue.evidence.web.response.PODResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class PODService {

    private final PODRepository podRepository;

    public Mono<ApiResponse<PODResponse>> generateOtp(String jobId) {
        // 6-digit numeric OTPs
        String otp1 = String.format("%06d", (int)(Math.random() * 1_000_000));
        String otp2 = String.format("%06d", (int)(Math.random() * 1_000_000));
        log.info("Generating OTP1 and OTP2 for jobId={}", jobId);
        return podRepository.save(POD.builder().jobId(jobId).otp1(otp1).otp2(otp2).build())
                .doOnSuccess(p -> log.info("POD saved id={} jobId={} otp1={} otp2={} createdAt={}", p.getId(), p.getJobId(), p.getOtp1(), p.getOtp2(), p.getCreatedAt()))
                .map(this::toResponse)
                .map(ApiResponse::created)
                .onErrorResume(e -> {
                    log.error("Failed to generate OTPs for jobId={}", jobId, e);
                    return Mono.just(ApiResponse.error("Failed to generate OTP: " + e.getMessage()));
                });
    }

    public Mono<ApiResponse<PODResponse>> getOtpByJobId(String jobId) {
        log.info("Fetching latest OTP for jobId={}", jobId);
        return podRepository.findFirstByJobIdOrderByCreatedAtDesc(jobId)
                .map(p -> ApiResponse.ok(new PODResponse(p.getId(), p.getJobId(), p.getOtp1(), p.getOtp2(), p.getCreatedAt(), p.getUpdatedAt())))
                .switchIfEmpty(Mono.just(ApiResponse.error("OTP not found for job")))
                .onErrorResume(e -> {
                    log.error("Failed fetching OTP for jobId={}", jobId, e);
                    return Mono.just(ApiResponse.error("Failed fetching OTP: " + e.getMessage()));
                });
    }

    public Mono<ApiResponse<String>> getDonorOtp(String jobId) {
        log.info("Fetching donor OTP1 for jobId={}", jobId);
        return podRepository.findFirstByJobIdOrderByCreatedAtDesc(jobId)
                .map(p -> ApiResponse.ok(p.getOtp1()))
                .switchIfEmpty(Mono.just(ApiResponse.error("OTP1 not found for job")))
                .onErrorResume(e -> Mono.just(ApiResponse.error("Failed fetching OTP1: " + e.getMessage())));
    }

    public Mono<ApiResponse<String>> getReceiverOtp(String jobId) {
        log.info("Fetching receiver OTP2 for jobId={}", jobId);
        return podRepository.findFirstByJobIdOrderByCreatedAtDesc(jobId)
                .map(p -> ApiResponse.ok(p.getOtp2()))
                .switchIfEmpty(Mono.just(ApiResponse.error("OTP2 not found for job")))
                .onErrorResume(e -> Mono.just(ApiResponse.error("Failed fetching OTP2: " + e.getMessage())));
    }

    public Mono<Boolean> verifyDonorOtp(String jobId, String code) {
        log.info("Verifying donor OTP1 for jobId={}", jobId);
        return podRepository.findFirstByJobIdOrderByCreatedAtDesc(jobId)
                .map(p -> code != null && code.equals(p.getOtp1()))
                .defaultIfEmpty(false)
                .onErrorResume(e -> Mono.just(false));
    }

    public Mono<Boolean> verifyReceiverOtp(String jobId, String code) {
        log.info("Verifying receiver OTP2 for jobId={}", jobId);
        return podRepository.findFirstByJobIdOrderByCreatedAtDesc(jobId)
                .map(p -> code != null && code.equals(p.getOtp2()))
                .defaultIfEmpty(false)
                .onErrorResume(e -> Mono.just(false));
    }
    
    // removed legacy create/verify/delete endpoints; OTP is generated and retrieved only
    
    private PODResponse toResponse(POD pod) {
        return new PODResponse(
                pod.getId(),
                pod.getJobId(),
                pod.getOtp1(),
                pod.getOtp2(),
                pod.getCreatedAt(),
                pod.getUpdatedAt()
        );
    }
}
