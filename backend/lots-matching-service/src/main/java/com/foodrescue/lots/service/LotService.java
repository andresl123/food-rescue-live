package com.foodrescue.lots.service;

import com.foodrescue.lots.dto.LotCreateRequest;
import com.foodrescue.lots.dto.LotUpdateRequest;
import com.foodrescue.lots.entity.Lot;
import com.foodrescue.lots.exception.AccessDeniedException;
import com.foodrescue.lots.exception.LotNotFoundException;
import com.foodrescue.lots.repository.LotRepository;
import com.foodrescue.lots.repository.FoodItemRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.UUID;

@Service
public class LotService {

    private final LotRepository lotRepository;
    private final FoodItemRepository foodItemRepository;

    public LotService(LotRepository lotRepository, FoodItemRepository foodItemRepository) {
        this.lotRepository = lotRepository;
        this.foodItemRepository = foodItemRepository;
    }

    public Mono<Lot> createLot(LotCreateRequest request, String donorId) {
        Lot newLot = Lot.builder()
                .lotId(UUID.randomUUID().toString())
                .userId(donorId)
                .description(request.getDescription())
                .totalItems(request.getTotalItems())
                .createdAt(Instant.now())
                .status("OPEN")
                .build();
        return lotRepository.save(newLot);
    }

    public Mono<Lot> updateLot(String lotId, LotUpdateRequest request, Mono<Authentication> authMono) {
        return authMono.map(Authentication::getName)
                .flatMap(userId ->
                        lotRepository.findById(lotId)
                                .switchIfEmpty(Mono.error(new LotNotFoundException("Lot with ID " + lotId + " not found.")))
                                .flatMap(lot -> {
                                    if (!lot.getUserId().equals(userId)) {
                                        return Mono.error(new AccessDeniedException("You do not have permission to update this lot."));
                                    }
                                    lot.setDescription(request.getDescription());
                                    lot.setStatus(request.getStatus());
                                    return lotRepository.save(lot);
                                })
                );
    }

    public Mono<Void> deleteLot(String lotId, Mono<Authentication> authMono) {
        return authMono.map(Authentication::getName)
                .flatMap(userId ->
                        // 1. Find the lot and verify ownership
                        lotRepository.findById(lotId)
                                .switchIfEmpty(Mono.error(new LotNotFoundException("Lot with ID " + lotId + " not found.")))
                                .flatMap(lot -> {
                                    if (!lot.getUserId().equals(userId)) {
                                        return Mono.error(new AccessDeniedException("You do not have permission to delete this lot."));
                                    }
                                    // 2. If authorized, first delete all associated food items
                                    return foodItemRepository.deleteByLotId(lotId)
                                            .then(Mono.defer(() -> {
                                                // 3. After items are deleted, delete the lot itself
                                                System.out.println("Deleting lot: " + lotId); // Optional logging
                                                return lotRepository.deleteById(lotId);
                                            }));
                                })
                );
    }
}