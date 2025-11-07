package com.foodrescue.uibff.receiver.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * Wrapper for the /api/v1/lots/{lotId} response
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class LotDetailsResponse {
    private LotData data;
    private boolean success;
}