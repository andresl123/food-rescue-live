package com.foodrescue.uibff.receiver.dto.orders;

public class FoodItemDto {
    private String itemId;
    private String lotId;
    private String itemName;
    private String category;
    private java.time.LocalDate expiryDate;
    private int quantity;
    private String unitOfMeasure;
    private java.time.Instant createdAt;

    public String getItemName() { return itemName; }
    public int getQuantity() { return quantity; }
    public String getUnitOfMeasure() { return unitOfMeasure; }
}
