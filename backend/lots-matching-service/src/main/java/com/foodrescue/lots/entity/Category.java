package com.foodrescue.lots.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum Category {
    DAIRY("dairy"),
    PRODUCE("produce"),  // fruits/veggies (you wrote "product", assuming "produce")
    BAKERY("bakery"),
    MEAT("meat"),
    SEAFOOD("seafood"),
    BEVERAGE("beverage"),
    PACKAGED("packaged"),
    FROZEN("frozen"),
    PREPARED("prepared"),
    OTHER("other");

    private final String label;

    Category(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static Category from(String value) {
        if (value == null) return null;
        String norm = value.trim().toLowerCase().replace(' ', '_').replace('-', '_');
        return Arrays.stream(values())
                .filter(c -> c.label.equalsIgnoreCase(value) || c.name().equalsIgnoreCase(norm))
                .findFirst()
                .orElse(OTHER);
    }
}
