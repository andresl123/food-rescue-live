package com.foodrescue.lots.service;

import com.foodrescue.lots.dto.LotCreateRequest;
import com.foodrescue.lots.dto.LotUpdateRequest;
import com.foodrescue.lots.entity.Lot;
import com.foodrescue.lots.exception.AccessDeniedException;
import com.foodrescue.lots.exception.LotNotFoundException;
import com.foodrescue.lots.repository.LotRepository;
import com.foodrescue.lots.repository.FoodItemRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.Collection;
import java.util.UUID;

@Service
public class LotService {

    private final LotRepository lotRepository;
    private final FoodItemRepository foodItemRepository;

    public LotService(LotRepository lotRepository, FoodItemRepository foodItemRepository) {
        this.lotRepository = lotRepository;
        this.foodItemRepository = foodItemRepository;
    }

    // REUSABLE SECURITY CHECK METHOD
    private Mono<Lot> checkLotAdminOrOwnership(String lotId, Mono<Authentication> authMono) {
        // Combine fetching the user auth and the lot
        return authMono.zipWith(lotRepository.findById(lotId)
                        .switchIfEmpty(Mono.error(new LotNotFoundException("Lot with ID " + lotId + " not found."))))
                .flatMap(tuple -> {
                    Authentication authentication = tuple.getT1();
                    Lot lot = tuple.getT2();
                    String userId = authentication.getName();
                    Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();

                    boolean isAdmin = authorities.stream()
                            .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ADMIN"));

                    // --- THE CORE LOGIC: Allow if ADMIN OR if DONOR owns the lot ---
                    if (isAdmin || lot.getUserId().equals(userId)) {
                        return Mono.just(lot); // Authorized, return the lot
                    } else {
                        return Mono.error(new AccessDeniedException("You do not have permission to modify this lot."));
                    }
                });
    }

    public Mono<Lot> createLot(LotCreateRequest request, String donorId) {
        Lot newLot = Lot.builder()
                .lotId(UUID.randomUUID().toString())
                .userId(donorId)
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .addressId(request.getAddressId())  // ✅ Add this line
                .totalItems(0)
                .createdAt(Instant.now())
                .status("ACTIVE")
                .build();

        return lotRepository.save(newLot);
    }



    public Flux<Lot> getAllLotsForAdmin(Mono<Authentication> authMono) {
        // Use flatMapMany to switch from a Mono<Authentication> to a Flux<Lot>
        return authMono.flatMapMany(authentication -> {
            // Check if the user's authorities list contains the ADMIN role.
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ADMIN"));

            if (isAdmin) {
                // If user is an admin, fetch all lots from the repository.
                return lotRepository.findAll();
            } else {
                // If not an admin, return a Flux that immediately signals an error.
                return Flux.error(new AccessDeniedException("You must be an admin to view all lots."));
            }
        });
    }

    public Mono<Lot> updateLot(String lotId, LotUpdateRequest request, Mono<Authentication> authMono) {
        return checkLotAdminOrOwnership(lotId, authMono)
                .flatMap(lot -> {
                    if (request.getDescription() != null && request.getDescription().isBlank()) {
                        return Mono.error(new IllegalArgumentException("Description cannot be blank."));
                    }
                    if (request.getDescription() != null) {
                        lot.setDescription(request.getDescription());
                    }
                    if (request.getStatus() != null) {
                        lot.setStatus(request.getStatus());
                    }
                    if (request.getImageUrl() != null) {
                        lot.setImageUrl(request.getImageUrl());
                    }
                    return lotRepository.save(lot);
                });
    }



    public Mono<Void> deleteLot(String lotId, Mono<Authentication> authMono) {
        return checkLotAdminOrOwnership(lotId, authMono)
                .flatMap(lotRepository::delete);
    }

    public Flux<Lot> getLotsForPrincipal(Mono<Authentication> authMono) {
        return authMono.flatMapMany(auth -> {
            boolean isAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority())); // note ROLE_ prefix
            if (isAdmin) {
                return lotRepository.findAll();
            }
            String userId = auth.getName();
            return lotRepository.findByUserId(userId);
        });
    }
}