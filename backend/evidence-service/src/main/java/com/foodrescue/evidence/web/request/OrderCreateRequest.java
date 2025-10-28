package com.foodrescue.evidence.web.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record OrderCreateRequest(
        @NotNull String receiverId,
        @NotBlank String status
) {}
