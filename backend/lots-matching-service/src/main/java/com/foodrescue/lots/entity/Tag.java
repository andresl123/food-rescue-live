package com.foodrescue.lots.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public enum Tag {
    VEG("veg"),
    VEGETARIAN("vegetarian"),
    VEGAN("vegan"),
    GLUTEN_FREE("glutenFree"),
    NUT_FREE("nutFree"),
    HALAL("halal"),
    KOSHER("kosher"),
    ORGANIC("organic"),
    LOW_SUGAR("lowSugar"),
    LOW_SODIUM("lowSodium"),
    SPICY("spicy"),
    PERISHABLE("perishable"),
    NON_PERISHABLE("nonPerishable"),
    REFRIGERATED("refrigerated"),
    FROZEN("frozen"),
    HOT("hot"),
    COLD("cold"),
    OTHER("other");

    private final String label;

    Tag(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static Tag from(String value) {
        if (value == null) return null;
        String norm = value.trim().toLowerCase().replace(' ', '_').replace('-', '_');
        return Arrays.stream(values())
                .filter(t -> t.label.equalsIgnoreCase(value) || t.name().equalsIgnoreCase(norm))
                .findFirst()
                .orElse(OTHER);
    }

}
