package com.foodrescue.lots.controller;

import com.foodrescue.lots.entity.FoodItem;
import com.foodrescue.lots.service.FoodItemService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1") // Base path for user-specific endpoints
public class UserItemsController {

    private final FoodItemService foodItemService;

    public UserItemsController(FoodItemService foodItemService) {
        this.foodItemService = foodItemService;
    }

    /**
     * Endpoint to get all food items associated with lots
     * owned by the currently authenticated user.
     */
    @GetMapping("/my-items")
    public Flux<FoodItem> getAllMyItems(Mono<Authentication> authenticationMono) {
        // Delegate the logic directly to the FoodItemService
        return foodItemService.getAllItemsForUser(authenticationMono);
    }
}