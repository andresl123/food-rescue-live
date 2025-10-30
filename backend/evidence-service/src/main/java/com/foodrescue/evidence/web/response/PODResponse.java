package com.foodrescue.evidence.web.response;

import java.time.Instant;

public record PODResponse(
        String id,
        String jobId,
        String otp,
        Instant createdAt,
        Instant updatedAt
) {}
