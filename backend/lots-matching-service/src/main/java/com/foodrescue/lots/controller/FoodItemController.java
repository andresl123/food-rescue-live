package com.foodrescue.lots.controller;

import com.foodrescue.lots.dto.FoodItemCreateRequest;
import com.foodrescue.lots.entity.FoodItem;
import com.foodrescue.lots.service.FoodItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/lots/{lotId}/items")
public class FoodItemController {

    private final FoodItemService foodItemService;

    public FoodItemController(FoodItemService foodItemService) {
        this.foodItemService = foodItemService;
    }

    @PostMapping
    public Mono<ResponseEntity<FoodItem>> addItem(
            @PathVariable String lotId, // ID is received as a String
            @Valid @RequestBody FoodItemCreateRequest request,
            Mono<Authentication> authenticationMono) { // Get user info

        // Pass everything to the service, which now handles validation
        return foodItemService.addItemToLot(request, lotId, authenticationMono)
                .map(createdItem -> ResponseEntity.status(HttpStatus.CREATED).body(createdItem));
        // Add .onErrorResume() here if you want specific handling for 404/403
    }
}
