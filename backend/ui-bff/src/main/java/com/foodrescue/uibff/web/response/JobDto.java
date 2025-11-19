package com.foodrescue.uibff.web.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.time.Instant;

// This will capture the response from your jobs-service
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class JobDto {
    private String jobId;
    private String orderId;
    private String status;
    private Instant completedAt; // This is the 'deliveryDate'
}