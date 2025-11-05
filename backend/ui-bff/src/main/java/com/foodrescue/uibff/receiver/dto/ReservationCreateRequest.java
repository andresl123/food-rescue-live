package com.foodrescue.uibff.receiver.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * This is what we will POST to the reservation service (8082).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationCreateRequest {
    private String lotId;
    private String deliveryAddressId;
    private String pickupAddressId;
}