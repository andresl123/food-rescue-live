package com.foodrescue.feedback_service.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrderFeedbackRequest {

    @NotBlank
    private String orderId;

    @NotBlank
    private String lotId;

    @Min(1)
    @Max(5)
    private int rating;

    private String feedbackText;
}
