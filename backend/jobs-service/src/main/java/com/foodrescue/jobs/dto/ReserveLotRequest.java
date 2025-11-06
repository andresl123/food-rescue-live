package com.foodrescue.jobs.dto;

import lombok.Data;

@Data
public class ReserveLotRequest {
    private String lotId;
    private String deliveryAddressId;
    private String pickupAddressId;
}
