package com.foodrescue.auth.web.response;

import java.time.Instant;
import java.util.Set;

public record UserResponse(
        String id,
        String name,
        String email,
        String categoryId,
        String phoneNumber,
        String defaultAddressId,
        Set<String> roles,
        String status,
        Instant createdAt,
        Instant updatedAt
) {}
