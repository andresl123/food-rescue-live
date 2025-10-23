package com.foodrescue.lots.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class FoodItemCreateRequest {

    @NotBlank(message = "Item name cannot be blank.")
    private String itemName;

    @NotBlank(message = "Category cannot be blank.")
    private String category;

    @FutureOrPresent(message = "Expiry date must be today or in the future.")
    private LocalDate expiryDate;

    @Min(value = 1, message = "Quantity must be at least 1.")
    private int quantity;

    @NotBlank(message = "Unit of measure cannot be blank.")
    private String unitOfMeasure;
}
