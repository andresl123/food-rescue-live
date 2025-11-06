package com.foodrescue.uibff.receiver.dto.orders;

import java.time.Instant;

public record LotDto(
        String lotId,
        String userId,
        String description,
        String imageUrl,
        Instant createdAt,
        String status,
        String addressId
        // you have category, totalItems, tags too, add if needed
) {}
