package com.foodrescue.lots.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LotUpdateRequest {

    @NotBlank(message = "Description cannot be blank.")
    private String description;

    @NotBlank(message = "Status cannot be blank.") // Consider adding validation for allowed statuses (e.g., OPEN, CLOSED)
    private String status;
}