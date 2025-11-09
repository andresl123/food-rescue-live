package com.foodrescue.lots.controller;

import com.foodrescue.lots.dto.FoodItemCreateRequest;
import com.foodrescue.lots.dto.FoodItemUpdateRequest;
import com.foodrescue.lots.entity.FoodItem;
import com.foodrescue.lots.service.FoodItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/v1/lots") // Base path for all methods in this controller
public class FoodItemController {

    private final FoodItemService foodItemService;

    public FoodItemController(FoodItemService foodItemService) {
        this.foodItemService = foodItemService;
    }

    /**
     * GET /api/v1/lots/items/all
     * Endpoint for ADMINS to retrieve every food item.
     */
    @GetMapping("/items/all")
    @PreAuthorize("hasRole('ADMIN')")
    public Flux<FoodItem> getAllFoodItems() {
        return foodItemService.getAllFoodItems();
    }

    /**
     * GET /api/v1/lots/{lotId}/items
     * Gets all items for a specific lot.
     * Accessible by: ADMIN (any lot) or DONOR (only their own lot).
     */
    // FIX: Added explicit path /{lotId}/items
    @GetMapping("/{lotId}/items")
    @PreAuthorize("hasAnyRole('ADMIN','DONOR')")
    public Flux<FoodItem> getItemsForLot(
            @PathVariable String lotId,
            Mono<Authentication> authenticationMono) {

        return foodItemService.getItemsForLot(lotId, authenticationMono);
    }

    /**
     * POST /api/v1/lots/{lotId}/items
     * Adds a new item to a specific lot.
     * Accessible by: DONOR (only their own lot).
     */
    // FIX: Added explicit path /{lotId}/items
    @PostMapping("/{lotId}/items")
    @PreAuthorize("hasRole('DONOR')")
    public Mono<ResponseEntity<FoodItem>> addItemToLot(
            @PathVariable String lotId,
            @Valid @RequestBody FoodItemCreateRequest request,
            Mono<Authentication> authenticationMono) {

        return foodItemService.addItemToLot(request, lotId, authenticationMono)
                .map(item -> ResponseEntity.status(HttpStatus.CREATED).body(item));
    }

    /**
     * PUT /api/v1/lots/{lotId}/items/{itemId}
     * Updates a specific item in a specific lot.
     * Accessible by: ADMIN (any item) or DONOR (only their own item).
     */
    // FIX: Changed path from "/{itemId}" to "/{lotId}/items/{itemId}"
    @PutMapping("/{lotId}/items/{itemId}")
    @PreAuthorize("hasAnyRole('ADMIN','DONOR')")
    public Mono<ResponseEntity<FoodItem>> updateItem(
            @PathVariable String lotId,
            @PathVariable String itemId,
            @Valid @RequestBody FoodItemUpdateRequest request,
            Mono<Authentication> authenticationMono) {

        return foodItemService.updateFoodItem(lotId, itemId, request, authenticationMono)
                .map(ResponseEntity::ok);
    }

    /**
     * DELETE /api/v1/lots/{lotId}/items/{itemId}
     * Deletes a specific item from a specific lot.
     * Accessible by: ADMIN (any item) or DONOR (only their own item).
     */
    // This path was already correct
    @DeleteMapping("/{lotId}/items/{itemId}")
    @PreAuthorize("hasAnyRole('ADMIN','DONOR')")
    public Mono<ResponseEntity<Void>> deleteFoodItem(
            @PathVariable String lotId,
            @PathVariable String itemId,
            Mono<Authentication> authenticationMono) {

        return foodItemService.deleteFoodItem(lotId, itemId, authenticationMono)
                .then(Mono.just(ResponseEntity.noContent().build()));
    }
    @GetMapping("/items/expiring-soon")
    @PreAuthorize("hasRole('ADMIN')")
    public Flux<FoodItem> getExpiringSoon() {
        return foodItemService.getExpiringSoon();
    }
}