package com.foodrescue.lots.service;

import com.foodrescue.lots.dto.FoodItemCreateRequest;
import com.foodrescue.lots.entity.FoodItem;
import com.foodrescue.lots.repository.FoodItemRepository;
import com.foodrescue.lots.repository.LotRepository;
import com.foodrescue.lots.exception.LotNotFoundException;
import com.foodrescue.lots.exception.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Instant;

@Service
public class FoodItemService {

    private final FoodItemRepository foodItemRepository;
    private final LotRepository lotRepository; // Need this to find the lot

    public FoodItemService(FoodItemRepository foodItemRepository, LotRepository lotRepository) {
        this.foodItemRepository = foodItemRepository;
        this.lotRepository = lotRepository;
    }

    public Mono<FoodItem> addItemToLot(FoodItemCreateRequest request, String lotId, Mono<Authentication> authMono) {

        // No need to convert lotId, it's already a String

        return authMono.map(Authentication::getName) // Get authenticated user's ID
                .flatMap(authenticatedUserId ->
                        // Find the lot by its String ID
                        lotRepository.findById(lotId)
                                // Log the result (optional, for debugging)
                                .log()
                                // If lot not found, throw error
                                .switchIfEmpty(Mono.error(new LotNotFoundException("Lot with ID " + lotId + " not found.")))
                                .flatMap(lot -> {
                                    // Security Check: Does the authenticated user own this lot?
                                    if (!lot.getUserId().equals(authenticatedUserId)) {
                                        return Mono.error(new AccessDeniedException("You do not have permission to add items to this lot."));
                                    }

                                    // If authorized, create and save the FoodItem
                                    FoodItem foodItem = FoodItem.builder()
                                            .lotId(lotId) // Use the String lotId
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
}
