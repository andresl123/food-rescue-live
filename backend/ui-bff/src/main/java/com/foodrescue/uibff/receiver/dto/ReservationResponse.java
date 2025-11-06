package com.foodrescue.uibff.receiver.dto;

import lombok.Data;

/**
 * Mirror of what the reservation service returns: order + job + pod
 */
@Data
public class ReservationResponse {
    private Object order;
    private Object job;
    private Object pod;
}
