package com.foodrescue.uibff.web.response;

import java.time.Instant;

public record AdminOrderView(
        String orderId,
        String jobId,
        String recipientName,
        String items,
        String pickupCode,
        String deliveryCode,
        Instant deliveryDate,
        String status
) {}