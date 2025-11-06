package com.foodrescue.lots.exception;

/**
 * Custom exception thrown when a specific Lot cannot be found in the database.
 */
public class LotNotFoundException extends RuntimeException {
    public LotNotFoundException(String message) {
        super(message);
    }
}