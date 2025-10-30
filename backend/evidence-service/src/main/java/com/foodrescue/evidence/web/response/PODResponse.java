package com.foodrescue.evidence.web.response;

import java.time.Instant;

public record PODResponse(
        String id,
        String jobId,
        String otp1,
        String otp2,
        Instant createdAt,
        Instant updatedAt
) {}
