package com.foodrescue.lots.entity;

import lombok.*;

import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ImportPreviewResponse {
    private List<LotPreviewDto> lots;
    private List<FoodItemPreviewDto> foodItems;
}