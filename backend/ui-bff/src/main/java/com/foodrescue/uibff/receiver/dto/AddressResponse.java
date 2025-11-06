package com.foodrescue.uibff.receiver.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * Wrapper for the /api/v1/addresses/{id} response
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AddressResponse {
    private boolean success;
    private AddressData data;
}
