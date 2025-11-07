package com.foodrescue.uibff.receiver.dto.orders;

public record AddressDto(
        String id,
        String street,
        String city,
        String state,
        String postalCode,
        String country
) {}
