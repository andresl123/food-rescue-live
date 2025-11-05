package com.foodrescue.uibff.receiver.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * Wrapper for the /api/v1/users/{receiverId}/default-address response
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class DefaultAddressResponse {
    private boolean success;
    private String defaultAddressId;
}