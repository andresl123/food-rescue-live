package com.foodrescue.evidence.web.response;

import java.time.Instant;
import java.time.LocalDate;

public record OrderResponse(
        String id,
        String receiverId,
        LocalDate orderDate,
        String status,
        Instant createdAt,
        Instant updatedAt
) {}
