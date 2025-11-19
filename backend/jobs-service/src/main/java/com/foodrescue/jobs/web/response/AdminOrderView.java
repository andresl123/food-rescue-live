package com.foodrescue.jobs.web.response;

import java.time.Instant;

public record AdminOrderView(
        String orderId,
        String jobId,
        String recipientName,
        String items,
        String pickupCode,   // <-- This name is correct
        String deliveryCode, // <-- This name is correct
        Instant deliveryDate,
        String status
) {}