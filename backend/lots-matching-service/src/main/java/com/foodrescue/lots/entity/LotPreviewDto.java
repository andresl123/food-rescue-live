package com.foodrescue.lots.entity;

import lombok.*;

import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class LotPreviewDto {
    private String lotKey;
    private String description;
    private String status;
    private String category;
    private String addressId;
    private List<String> tags;
}
