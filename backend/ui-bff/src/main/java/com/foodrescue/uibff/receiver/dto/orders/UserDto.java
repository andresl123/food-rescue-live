package com.foodrescue.uibff.receiver.dto.orders;

public record UserDto(
        String id,
        String name,
        String email,
        String phoneNumber,
        String defaultAddressId
) {}
