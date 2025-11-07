package com.foodrescue.uibff.receiver.dto.orders;

public record AddressEnvelope(
        boolean success,
        AddressDto data
) {}
