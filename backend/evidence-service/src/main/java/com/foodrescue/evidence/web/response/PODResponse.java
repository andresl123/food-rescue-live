package com.foodrescue.evidence.web.response;

import java.time.Instant;

public record PODResponse(
        String id,
        String jobId,
        String pickupCode,
        String deliveryCode,
        Instant pickupGeneratedAt,
        Instant deliveryGeneratedAt,
        Instant pickupVerifiedAt,
        Instant deliveryVerifiedAt,
        int pickupAttempts,
        int deliveryAttempts,
        Instant createdAt,
        Instant updatedAt
) {}
