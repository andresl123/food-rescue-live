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
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;

import java.util.Collection;
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

    // --- 1. THE NEW REUSABLE AUTHORIZATION METHOD ---
    // (This is your original 'checkLotAdminOrOwnershipForItemAccess' method, renamed)
    private Mono<Lot> authorizeAdminOrLotOwner(String lotId, Mono<Authentication> authMono) {
        return authMono.zipWith(lotRepository.findById(lotId)
                        .switchIfEmpty(Mono.error(new LotNotFoundException("Lot with ID " + lotId + " not found."))))
                .flatMap(tuple -> {
                    Authentication auth = tuple.getT1();
                    Lot lot = tuple.getT2();
                    String currentUserId = auth.getName();

                    boolean isAdmin = auth.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

                    // This is the core logic: Allow if ADMIN or if DONOR owns the lot
                    if (isAdmin || lot.getUserId().equals(currentUserId)) {
                        return Mono.just(lot); // Authorized, return the lot for chaining
                    } else {
                        return Mono.error(new AccessDeniedException("You do not have permission to access items in this lot."));
                    }
                });
    }

    /**
     * ADMIN-only method to get all food items from all lots.
     * Security is handled by @PreAuthorize("hasRole('ADMIN')") in the controller.
     */
    public Flux<FoodItem> getAllFoodItems() {
        return foodItemRepository.findAll();
    }

    /**
     * GET ITEMS: Checks for Admin/Owner, then finds items.
     */
    public Flux<FoodItem> getItemsForLot(String lotId, Mono<Authentication> authMono) {
        // 1. Authorize
        return authorizeAdminOrLotOwner(lotId, authMono)
                // 2. If successful, proceed to get items
                .thenMany(foodItemRepository.findByLotId(lotId));
    }

    /**
     * UPDATE ITEM: Checks for Admin/Owner, then finds and updates the item.
     */
    public Mono<FoodItem> updateFoodItem(String lotId, String itemId, FoodItemUpdateRequest request, Mono<Authentication> authMono) {
        // 1. Authorize
        return authorizeAdminOrLotOwner(lotId, authMono)
                // 2. If successful, proceed to find the item
                .flatMap(authorizedLot -> // We get the lot but don't need it
                        foodItemRepository.findById(itemId)
                                .switchIfEmpty(Mono.error(new FoodItemNotFoundException("Food Item with ID " + itemId + " not found.")))
                                .flatMap(item -> {
                                    // 3. Data integrity check
                                    if (!item.getLotId().equals(lotId)) {
                                        return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item does not belong to the specified lot."));
                                    }

                                    // 4. Update and save
                                    item.setItemName(request.getItemName());
                                    item.setCategory(request.getCategory());
                                    item.setExpiryDate(request.getExpiryDate());
                                    item.setQuantity(request.getQuantity());
                                    item.setUnitOfMeasure(request.getUnitOfMeasure());
                                    return foodItemRepository.save(item);
                                })
                );
    }

    /**
     * DELETE ITEM: Checks for Admin/Owner, then finds and deletes the item.
     */
    public Mono<Void> deleteFoodItem(String lotId, String itemId, Mono<Authentication> authMono) {
        // 1. Authorize
        return authorizeAdminOrLotOwner(lotId, authMono)
                // 2. If successful, proceed to find the item
                .flatMap(authorizedLot -> // We get the lot but don't need it
                        foodItemRepository.findById(itemId)
                                .switchIfEmpty(Mono.error(new FoodItemNotFoundException("Food Item with ID " + itemId + " not found.")))
                                .flatMap(item -> {
                                    // 3. Data integrity check
                                    if (!item.getLotId().equals(lotId)) {
                                        return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item does not belong to the specified lot."));
                                    }
                                    // 4. Delete
                                    return foodItemRepository.delete(item);
                                })
                );
    }

    // This method has a *different* check (checkLotOwnership)
    // which is correct because only the owner can add items to their *own* lot.
    public Mono<FoodItem> addItemToLot(FoodItemCreateRequest request, String lotId, Mono<Authentication> authMono) {
        return authMono.map(Authentication::getName)
                .flatMap(userId ->
                        checkLotOwnership(lotId, userId) // Uses the stricter check
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

    // This check is used only by addItemToLot
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

    // This method is also unchanged
    public Flux<FoodItem> getAllItemsForUser(Mono<Authentication> authMono) {
        return authMono.map(Authentication::getName)
                .flatMapMany(userId ->
                        lotRepository.findByUserId(userId)
                                .map(Lot::getLotId)
                                .collectList()
                                .flatMapMany(lotIds -> {
                                    if (lotIds.isEmpty()) {
                                        return Flux.empty();
                                    }
                                    return foodItemRepository.findByLotIdIn(lotIds);
                                })
                );
    }
}