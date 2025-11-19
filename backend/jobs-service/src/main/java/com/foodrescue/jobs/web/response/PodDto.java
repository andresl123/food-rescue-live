package com.foodrescue.jobs.web.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true) // This tells Java to ignore the 10 extra fields
public class PodDto {
    private String pickupCode;
    private String deliveryCode;
}