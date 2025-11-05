package com.foodrescue.evidence.web.response;

import java.time.Instant;

public record PODResponse(
        String id,
        String jobId,
        String pickupOtp,
        String deliveryOtp,
        Instant createdAt,
        Instant updatedAt
) {}
