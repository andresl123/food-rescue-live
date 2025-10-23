package com.foodrescue.lots.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(LotNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleLotNotFound(LotNotFoundException ex) {
        return new ResponseEntity<>(Map.of("error", ex.getMessage()), HttpStatus.NOT_FOUND); // 404
    }

    // HANDLER FOR FOOD ITEM NOT FOUND
    @ExceptionHandler(FoodItemNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleFoodItemNotFound(FoodItemNotFoundException ex) {
        return new ResponseEntity<>(Map.of("error", ex.getMessage()), HttpStatus.NOT_FOUND); // 404
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(AccessDeniedException ex) {
        return new ResponseEntity<>(Map.of("error", ex.getMessage()), HttpStatus.FORBIDDEN); // 403
    }

    // HANDLER FOR ITEM/LOT MISMATCH
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(ResponseStatusException ex) {
        return new ResponseEntity<>(Map.of("error", ex.getReason()), ex.getStatusCode());
    }
}