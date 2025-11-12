package com.foodrescue.lots.entity;

import lombok.*;

import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class FoodItemImportRow {
    private String lotKey;      // must match a Lot row
    private String itemName;
    private String category;
    private LocalDate expiryDate;
    private Integer quantity;
    private String unitOfMeasure;
}
