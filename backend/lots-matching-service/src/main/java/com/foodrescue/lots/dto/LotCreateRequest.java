package com.foodrescue.lots.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LotCreateRequest {

    @NotBlank(message = "Description cannot be blank.")
    private String description;

    @Min(value = 1, message = "Total items must be at least 1.")
    private int totalItems;
}