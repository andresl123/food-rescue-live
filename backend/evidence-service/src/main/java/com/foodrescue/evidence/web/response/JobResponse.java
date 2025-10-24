package com.foodrescue.evidence.web.response;

import java.time.Instant;
import java.time.LocalDate;

public record JobResponse(
        String id,
        String courierId,
        String orderId,
        String status,
        LocalDate assignedAt,
        LocalDate completedAt,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {}
