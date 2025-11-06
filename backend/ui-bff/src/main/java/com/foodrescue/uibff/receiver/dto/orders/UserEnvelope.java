package com.foodrescue.uibff.receiver.dto.orders;

public record UserEnvelope(
        boolean success,
        UserDto data
) {}
