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
        String pickupOtp = String.format("%06d", (int)(Math.random() * 1_000_000));
        String deliveryOtp = String.format("%06d", (int)(Math.random() * 1_000_000));
        log.info("Generating pickup OTP and delivery OTP for jobId={}", jobId);
        return podRepository.save(POD.builder().jobId(jobId).pickupOtp(pickupOtp).deliveryOtp(deliveryOtp).build())
                .doOnSuccess(p -> log.info("POD saved id={} jobId={} pickupOtp={} deliveryOtp={} createdAt={}", p.getId(), p.getJobId(), p.getPickupOtp(), p.getDeliveryOtp(), p.getCreatedAt()))
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
                .map(p -> ApiResponse.ok(new PODResponse(p.getId(), p.getJobId(), p.getPickupOtp(), p.getDeliveryOtp(), p.getCreatedAt(), p.getUpdatedAt())))
                .switchIfEmpty(Mono.just(ApiResponse.error("OTP not found for job")))
                .onErrorResume(e -> {
                    log.error("Failed fetching OTP for jobId={}", jobId, e);
                    return Mono.just(ApiResponse.error("Failed fetching OTP: " + e.getMessage()));
                });
    }

    public Mono<ApiResponse<String>> getDonorOtp(String jobId) {
        log.info("Fetching pickup OTP for jobId={}", jobId);
        return podRepository.findFirstByJobIdOrderByCreatedAtDesc(jobId)
                .map(p -> ApiResponse.ok(p.getPickupOtp()))
                .switchIfEmpty(Mono.just(ApiResponse.error("Pickup OTP not found for job")))
                .onErrorResume(e -> Mono.just(ApiResponse.error("Failed fetching pickup OTP: " + e.getMessage())));
    }

    public Mono<ApiResponse<String>> getReceiverOtp(String jobId) {
        log.info("Fetching delivery OTP for jobId={}", jobId);
        return podRepository.findFirstByJobIdOrderByCreatedAtDesc(jobId)
                .map(p -> ApiResponse.ok(p.getDeliveryOtp()))
                .switchIfEmpty(Mono.just(ApiResponse.error("Delivery OTP not found for job")))
                .onErrorResume(e -> Mono.just(ApiResponse.error("Failed fetching delivery OTP: " + e.getMessage())));
    }

    public Mono<Boolean> verifyDonorOtp(String jobId, String code) {
        log.info("Verifying pickup OTP for jobId={}", jobId);
        return podRepository.findFirstByJobIdOrderByCreatedAtDesc(jobId)
                .map(p -> code != null && code.equals(p.getPickupOtp()))
                .defaultIfEmpty(false)
                .onErrorResume(e -> Mono.just(false));
    }

    public Mono<Boolean> verifyReceiverOtp(String jobId, String code) {
        log.info("Verifying delivery OTP for jobId={}", jobId);
        return podRepository.findFirstByJobIdOrderByCreatedAtDesc(jobId)
                .map(p -> code != null && code.equals(p.getDeliveryOtp()))
                .defaultIfEmpty(false)
                .onErrorResume(e -> Mono.just(false));
    }

    public Mono<ApiResponse<String>> deleteByJobId(String jobId) {
        log.info("Deleting POD records for jobId={}", jobId);
        return podRepository.findByJobId(jobId)
                .collectList()
                .flatMap(pods -> {
                    if (pods.isEmpty()) {
                        log.warn("No POD records found for jobId={}", jobId);
                        return Mono.just(ApiResponse.<String>error("No POD records found for jobId: " + jobId));
                    }
                    log.info("Found {} POD record(s) to delete for jobId={}", pods.size(), jobId);
                    return podRepository.deleteAll(pods)
                            .then(Mono.just(ApiResponse.ok("Successfully deleted " + pods.size() + " POD record(s) for jobId: " + jobId)))
                            .doOnSuccess(result -> log.info("Successfully deleted {} POD record(s) for jobId={}", pods.size(), jobId));
                })
                .onErrorResume(e -> {
                    log.error("Failed to delete POD records for jobId={}", jobId, e);
                    return Mono.just(ApiResponse.<String>error("Failed to delete POD records: " + e.getMessage()));
                });
    }
    
    // removed legacy create/verify/delete endpoints; OTP is generated and retrieved only
    
    private PODResponse toResponse(POD pod) {
        return new PODResponse(
                pod.getId(),
                pod.getJobId(),
                pod.getPickupOtp(),
                pod.getDeliveryOtp(),
                pod.getCreatedAt(),
                pod.getUpdatedAt()
        );
    }
}
