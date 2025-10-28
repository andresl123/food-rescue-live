package com.foodrescue.evidence.web.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record JobCreateRequest(
        @NotNull String courierId,
        @NotNull String orderId,
        @NotBlank String status,
        String notes
) {}
