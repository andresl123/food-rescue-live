package com.foodrescue.lots.entity;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class LotImportRow {
    // from Excel
    private String lotKey;      // used to match FoodItems
    private String description;
    private String status;
    private String category;
    private String addressId;
    private String tag1;
    private String tag2;
    private String tag3;
}