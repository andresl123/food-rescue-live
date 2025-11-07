package com.foodrescue.uibff.receiver.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

/**
 * Wrapper for the /api/v1/lots/dashboard response
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class LotListResponse {
    private List<LotData> data;
}