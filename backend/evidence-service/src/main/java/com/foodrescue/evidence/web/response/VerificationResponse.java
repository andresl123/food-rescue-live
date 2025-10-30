package com.foodrescue.evidence.web.response;

public record VerificationResponse(
        boolean verified,
        String message,
        String receiverId,
        String recipientName,
        String deliveryAddress
) {}
