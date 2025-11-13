package com.foodrescue.evidence.service;

import com.foodrescue.evidence.entity.POD;
import com.foodrescue.evidence.repository.PODRepository;
import com.foodrescue.evidence.web.request.PODCreateRequest;
import com.foodrescue.evidence.web.request.VerificationRequest;
import com.foodrescue.evidence.web.response.ApiResponse;
import com.foodrescue.evidence.web.response.PODResponse;
import com.foodrescue.evidence.web.response.VerificationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PODService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final PODRepository repository;

    public Mono<ApiResponse<PODResponse>> create(PODCreateRequest request) {
        String pickupCode = request.pickupCode() != null ? request.pickupCode() : generateOtp();
        String deliveryCode = request.deliveryCode() != null ? request.deliveryCode() : generateOtp();

        POD pod = POD.builder()
                .id(UUID.randomUUID().toString())
                .jobId(request.jobId())
                .pickupCode(pickupCode)
                .deliveryCode(deliveryCode)
                .pickupGeneratedAt(Instant.now())
                .deliveryGeneratedAt(Instant.now())
                .build();

        return repository.save(pod)
                .map(this::toResponse)
                .map(ApiResponse::created);
    }

    public Mono<ApiResponse<PODResponse>> generateOtps(String jobId) {
        return repository.findFirstByJobIdOrderByCreatedAtDesc(jobId)
                .defaultIfEmpty(POD.builder().jobId(jobId).build())
                .flatMap(existing -> {
                    existing.setId(existing.getId() != null ? existing.getId() : UUID.randomUUID().toString());
                    existing.setPickupCode(generateOtp());
                    existing.setPickupGeneratedAt(Instant.now());
                    existing.setPickupVerifiedAt(null);
                    existing.setPickupAttempts(0);

                    existing.setDeliveryCode(generateOtp());
                    existing.setDeliveryGeneratedAt(Instant.now());
                    existing.setDeliveryVerifiedAt(null);
                    existing.setDeliveryAttempts(0);

                    existing.setLastVerificationMethod("otp");
                    return repository.save(existing);
                })
                .map(this::toResponse)
                .map(ApiResponse::created);
    }

    public Mono<ApiResponse<PODResponse>> getLatestForJob(String jobId) {
        return repository.findFirstByJobIdOrderByCreatedAtDesc(jobId)
                .map(this::toResponse)
                .map(ApiResponse::ok)
                .switchIfEmpty(Mono.just(ApiResponse.error("POD not found for job " + jobId)));
    }

    public Flux<PODResponse> getByJobId(String jobId) {
        return repository.findByJobId(jobId)
                .map(this::toResponse);
    }

    public Mono<ApiResponse<VerificationResponse>> verify(String jobId, String verificationRole, String code) {
        return repository.findFirstByJobIdOrderByCreatedAtDesc(jobId)
                .flatMap(pod -> verifyAndPersist(pod, verificationRole, code))
                .switchIfEmpty(Mono.just(ApiResponse.error("POD record not found for job " + jobId)));
    }

    public Mono<ApiResponse<VerificationResponse>> verify(VerificationRequest request) {
        return verify(request.jobId(), request.verificationType(), request.verificationCode());
    }

    public Mono<ApiResponse<Void>> delete(String id) {
        return repository.deleteById(id)
                .thenReturn(ApiResponse.ok(null));
    }

    public Mono<ApiResponse<Void>> deleteByJobId(String jobId) {
        return repository.findByJobId(jobId)
                .flatMap(pod -> repository.deleteById(pod.getId()))
                .then(Mono.just(ApiResponse.ok(null)));
    }

    private Mono<ApiResponse<VerificationResponse>> verifyAndPersist(POD pod, String role, String code) {
        String normalizedRole = normalizeRole(role);
        if (!"pickup".equals(normalizedRole) && !"delivery".equals(normalizedRole)) {
            return Mono.just(ApiResponse.error("Unsupported verification role: " + role));
        }

        boolean valid;
        Instant verifiedAt = Instant.now();
        String expectedCode;

        if ("pickup".equals(normalizedRole)) {
            pod.setPickupAttempts(pod.getPickupAttempts() + 1);
            expectedCode = pod.getPickupCode();
            valid = expectedCode != null && expectedCode.equals(code);
            if (valid) {
                pod.setPickupVerifiedAt(verifiedAt);
            }
        } else {
            pod.setDeliveryAttempts(pod.getDeliveryAttempts() + 1);
            expectedCode = pod.getDeliveryCode();
            valid = expectedCode != null && expectedCode.equals(code);
            if (valid) {
                pod.setDeliveryVerifiedAt(verifiedAt);
            }
        }

        pod.setLastVerificationMethod("otp");

        if (!valid) {
            // Persist attempt counts even when invalid
            return repository.save(pod)
                    .thenReturn(ApiResponse.ok(
                            new VerificationResponse(
                                    false,
                                    normalizedRole,
                                    "Incorrect verification code",
                                    null,
                                    attemptsForRole(pod, normalizedRole)
                            )
                    ));
        }

        return repository.save(pod)
                .map(saved -> new VerificationResponse(
                        true,
                        normalizedRole,
                        "Verification successful",
                        "pickup".equals(normalizedRole) ? saved.getPickupVerifiedAt() : saved.getDeliveryVerifiedAt(),
                        attemptsForRole(saved, normalizedRole)
                ))
                .map(ApiResponse::ok);
    }

    private PODResponse toResponse(POD pod) {
        return new PODResponse(
                pod.getId(),
                pod.getJobId(),
                pod.getPickupCode(),
                pod.getDeliveryCode(),
                pod.getPickupGeneratedAt(),
                pod.getDeliveryGeneratedAt(),
                pod.getPickupVerifiedAt(),
                pod.getDeliveryVerifiedAt(),
                pod.getPickupAttempts(),
                pod.getDeliveryAttempts(),
                pod.getCreatedAt(),
                pod.getUpdatedAt()
        );
    }

    private String generateOtp() {
        int number = RANDOM.nextInt(900_000) + 100_000;
        return Integer.toString(number);
    }

    private String normalizeRole(String role) {
        return role == null ? "" : role.trim().toLowerCase(Locale.ROOT);
    }

    private int attemptsForRole(POD pod, String role) {
        return "pickup".equals(role) ? pod.getPickupAttempts() : pod.getDeliveryAttempts();
    }
}

