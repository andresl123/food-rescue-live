package com.foodrescue.lots.entity;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@Document("food_items")
public class FoodItem {

    @Id
    @Field("item_id")
    private String itemId; // Auto-generated String ID

    @Field("lot_id")
    private String lotId; // References Lot via String ID

    @Field("item_name")
    private String itemName;

    private String category;

    @Field("expiry_date")
    private LocalDate expiryDate;

    private int quantity;

    @Field("unit_of_measure")
    private String unitOfMeasure;

    @Field("created_at")
    private Instant createdAt;
}
