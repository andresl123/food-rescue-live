package com.foodrescue.uibff.web.response;

// This DTO must match the one in your jobs-service
public record RecentOrderDto(
        String orderId,
        String recipientName,
        String status
) {}