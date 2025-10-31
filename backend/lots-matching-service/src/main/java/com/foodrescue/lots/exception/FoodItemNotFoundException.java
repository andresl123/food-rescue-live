package com.foodrescue.lots.exception;

/**
 * Custom exception thrown when a specific FoodItem cannot be found in the database.
 */
public class FoodItemNotFoundException extends RuntimeException {
    public FoodItemNotFoundException(String message) {
        super(message);
    }
}