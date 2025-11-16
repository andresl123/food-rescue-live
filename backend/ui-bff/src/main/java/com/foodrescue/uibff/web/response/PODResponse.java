package com.foodrescue.uibff.web.response;

import java.time.Instant;

// This must match the PODResponse from your evidence-service
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