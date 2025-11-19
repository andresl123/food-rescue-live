package com.foodrescue.jobs.web.response;

// This record holds the 3 fields we need for the card
public record RecentOrderDto(
        String orderId,
        String recipientName,
        String status
) {}