package com.foodrescue.uibff.web.response;

import java.time.Instant;

// This record MUST match the AdminOrderView DTO in your jobs-service
public record AdminOrderView(
        String orderId,
        String jobId,
        String recipientName,
        String items,
        String pickupOtp,
        String deliveryOtp,
        Instant deliveryDate,
        String status
) {}