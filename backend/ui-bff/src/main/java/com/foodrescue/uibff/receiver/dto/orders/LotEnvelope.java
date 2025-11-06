package com.foodrescue.uibff.receiver.dto.orders;

public record LotEnvelope(
        boolean success,
        LotDto data
) {}
