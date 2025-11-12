package com.foodrescue.lots.entity;

import lombok.*;

import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ImportResult {
    private int lotsCreated;
    private int itemsCreated;
    private List<String> warnings;
}