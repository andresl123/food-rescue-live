package com.foodrescue.evidence.web.request;

import jakarta.validation.constraints.NotBlank;

public record VerificationRequest(
        @NotBlank String jobId,
        @NotBlank String verificationType,
        @NotBlank String verificationMethod,
        @NotBlank String verificationCode
) {}
