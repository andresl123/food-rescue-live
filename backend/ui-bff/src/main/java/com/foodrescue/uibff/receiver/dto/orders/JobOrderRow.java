package com.foodrescue.uibff.receiver.dto.orders;

public record JobOrderRow(
        String id,
        String date,
        String status,
        String lot_id,
        String donor_address,
        String receiver_id,
        String recipient_address,
        String courier_id
) {}
