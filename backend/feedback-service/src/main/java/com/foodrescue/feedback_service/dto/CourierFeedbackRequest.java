package com.foodrescue.feedback_service.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CourierFeedbackRequest {

    @NotBlank
    private String courierId;

    // good to link it
    private String orderId;

    @Min(1)
    @Max(5)
    private int rating;

    private String feedbackText;
}