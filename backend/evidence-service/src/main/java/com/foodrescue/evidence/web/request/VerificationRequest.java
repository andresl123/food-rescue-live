package com.foodrescue.evidence.web.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record VerificationRequest(
        @NotNull String jobId,
        @NotBlank String verificationCode
) {}
