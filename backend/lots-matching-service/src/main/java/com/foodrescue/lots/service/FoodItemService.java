package com.foodrescue.lots.service;

import com.foodrescue.lots.dto.FoodItemCreateRequest;
import com.foodrescue.lots.dto.FoodItemUpdateRequest;
import com.foodrescue.lots.entity.FoodItem;
import com.foodrescue.lots.entity.Lot;
import com.foodrescue.lots.exception.AccessDeniedException;
import com.foodrescue.lots.exception.FoodItemNotFoundException;
import com.foodrescue.lots.exception.LotNotFoundException;
import com.foodrescue.lots.repository.FoodItemRepository;
import com.foodrescue.lots.repository.LotRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.UUID;

@Service
public class FoodItemService {

    private final FoodItemRepository foodItemRepository;
    private final LotRepository lotRepository;

    public FoodItemService(FoodItemRepository foodItemRepository, LotRepository lotRepository) {
        this.foodItemRepository = foodItemRepository;
        this.lotRepository = lotRepository;
    }

    // SECURITY CHECK METHOD TO BE REUSED
    private Mono<Lot> checkLotOwnership(String lotId, String userId) {
        return lotRepository.findById(lotId)
                .switchIfEmpty(Mono.error(new LotNotFoundException("Lot with ID " + lotId + " not found.")))
                .flatMap(lot -> {
                    if (!lot.getUserId().equals(userId)) {
                        return Mono.error(new AccessDeniedException("You do not have permission to modify items in this lot."));
                    }
                    return Mono.just(lot); // Return the lot if ownership is verified
                });
    }

    public Mono<FoodItem> addItemToLot(FoodItemCreateRequest request, String lotId, Mono<Authentication> authMono) {
        return authMono.map(Authentication::getName)
                .flatMap(userId ->
                        checkLotOwnership(lotId, userId)
                                .flatMap(lot -> {
                                    FoodItem foodItem = FoodItem.builder()
                                            .itemId(UUID.randomUUID().toString())
                                            .lotId(lotId)
                                            .itemName(request.getItemName())
                                            .category(request.getCategory())
                                            .expiryDate(request.getExpiryDate())
                                            .quantity(request.getQuantity())
                                            .unitOfMeasure(request.getUnitOfMeasure())
                                            .createdAt(Instant.now())
                                            .build();
                                    return foodItemRepository.save(foodItem);
                                })
                );
    }

    // UPDATE FOOD ITEM METHOD
    public Mono<FoodItem> updateFoodItem(String lotId, String itemId, FoodItemUpdateRequest request, Mono<Authentication> authMono) {
        return authMono.map(Authentication::getName)
                .flatMap(userId ->
                        // 1. Verify user owns the lot first
                        checkLotOwnership(lotId, userId)
                                .flatMap(lot ->
                                        // 2. Find the specific item by its ID
                                        foodItemRepository.findById(itemId)
                                                .switchIfEmpty(Mono.error(new FoodItemNotFoundException("Food Item with ID " + itemId + " not found.")))
                                                .flatMap(item -> {
                                                    // 3. Sanity check: Does this item actually belong to this lot?
                                                    if (!item.getLotId().equals(lotId)) {
                                                        // Throw a generic error or a specific one if you prefer
                                                        return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item does not belong to the specified lot."));
                                                    }
                                                    // 4. Update the item's fields
                                                    item.setItemName(request.getItemName());
                                                    item.setCategory(request.getCategory());
                                                    item.setExpiryDate(request.getExpiryDate());
                                                    item.setQuantity(request.getQuantity());
                                                    item.setUnitOfMeasure(request.getUnitOfMeasure());
                                                    // Note: You might want an 'updatedAt' field here
                                                    return foodItemRepository.save(item);
                                                })
                                )
                );
    }

    // DELETE FOOD ITEM METHOD
    public Mono<Void> deleteFoodItem(String lotId, String itemId, Mono<Authentication> authMono) {
        return authMono.map(Authentication::getName)
                .flatMap(userId ->
                        // 1. Verify user owns the lot first
                        checkLotOwnership(lotId, userId)
                                .flatMap(lot ->
                                        // 2. Find the specific item by its ID
                                        foodItemRepository.findById(itemId)
                                                .switchIfEmpty(Mono.error(new FoodItemNotFoundException("Food Item with ID " + itemId + " not found.")))
                                                .flatMap(item -> {
                                                    // 3. Sanity check: Does this item actually belong to this lot?
                                                    if (!item.getLotId().equals(lotId)) {
                                                        return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item does not belong to the specified lot."));
                                                    }
                                                    // 4. Delete the item
                                                    return foodItemRepository.deleteById(itemId);
                                                })
                                )
                );
    }
}