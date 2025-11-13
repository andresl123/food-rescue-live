package com.foodrescue.evidence.web.response;

import java.time.Instant;

public record VerificationResponse(
        boolean verified,
        String verificationType,
        String message,
        Instant verifiedAt,
        int attempts
) {}
