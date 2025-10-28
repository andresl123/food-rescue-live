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
import java.util.List;
import java.util.stream.Collectors;

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

    private Mono<Lot> checkLotAdminOrOwnershipForItemAccess(String lotId, Mono<Authentication> authMono) {
        return authMono.zipWith(lotRepository.findById(lotId)
                        .switchIfEmpty(Mono.error(new LotNotFoundException("Lot with ID " + lotId + " not found."))))
                .flatMap(tuple -> {
                    Authentication authentication = tuple.getT1();
                    Lot lot = tuple.getT2();
                    String userId = authentication.getName();
                    Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();

                    boolean isAdmin = authorities.stream()
                            .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"));

                    if (isAdmin || lot.getUserId().equals(userId)) {
                        return Mono.just(lot); // Authorized
                    } else {
                        return Mono.error(new AccessDeniedException("You do not have permission to access items in this lot."));
                    }
                });
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

    // METHOD TO GET ITEMS FOR A LOT
    public Flux<FoodItem> getItemsForLot(String lotId, Mono<Authentication> authMono) {
        return checkLotAdminOrOwnershipForItemAccess(lotId, authMono)
                .thenMany(foodItemRepository.findByLotId(lotId));
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
        return checkLotAdminOrOwnershipForItemAccess(lotId, authMono)
                .flatMap(lot ->
                        foodItemRepository.findById(itemId)
                                .switchIfEmpty(Mono.error(new FoodItemNotFoundException("Food Item with ID " + itemId + " not found.")))
                                .flatMap(item -> {
                                    if (!item.getLotId().equals(lotId)) {
                                        return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item does not belong to the specified lot."));
                                    }
                                    item.setItemName(request.getItemName());
                                    item.setCategory(request.getCategory());
                                    item.setExpiryDate(request.getExpiryDate());
                                    item.setQuantity(request.getQuantity());
                                    item.setUnitOfMeasure(request.getUnitOfMeasure());
                                    return foodItemRepository.save(item);
                                })
                );
    }

    // DELETE FOOD ITEM METHOD
    public Mono<Void> deleteFoodItem(String lotId, String itemId, Mono<Authentication> authMono) {
        return checkLotAdminOrOwnershipForItemAccess(lotId, authMono)
                .flatMap(lot ->
                        foodItemRepository.findById(itemId)
                                .switchIfEmpty(Mono.error(new FoodItemNotFoundException("Food Item with ID " + itemId + " not found.")))
                                .flatMap(item -> {
                                    if (!item.getLotId().equals(lotId)) {
                                        return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item does not belong to the specified lot."));
                                    }
                                    return foodItemRepository.deleteById(itemId);
                                })
                );
    }
    // GET ALL ITEMS FOR A USER BASED IN LOTID
    public Flux<FoodItem> getAllItemsForUser(Mono<Authentication> authMono) {
        // 1. Get the authenticated user's ID
        return authMono.map(Authentication::getName)
                .flatMapMany(userId ->
                        // 2. Find all lots owned by this user
                        lotRepository.findByUserId(userId)
                                // 3. Extract the lot IDs from the found lots
                                .map(Lot::getLotId) // Get the ID string from each Lot object
                                .collectList() // Collect all the lot IDs into a List<String>
                                .flatMapMany(lotIds -> {
                                    // 4. Handle the case where the user has no lots
                                    if (lotIds.isEmpty()) {
                                        return Flux.empty(); // Return an empty stream if no lots found
                                    }
                                    // 5. Find all food items whose lotId is in the collected list
                                    return foodItemRepository.findByLotIdIn(lotIds);
                                })
                );
    }
}