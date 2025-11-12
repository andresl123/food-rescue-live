package com.foodrescue.lots.entity;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class FoodItemPreviewDto {
    private String lotKey;
    private String itemName;
    private String category;
    private String expiryDate;
    private Integer quantity;
    private String unitOfMeasure;
}