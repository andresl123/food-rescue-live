package com.foodrescue.evidence.web.request;

import jakarta.validation.constraints.NotNull;

public record PODCreateRequest(
        @NotNull String jobId,
        String pickupCode,
        String deliveryCode
) {}
