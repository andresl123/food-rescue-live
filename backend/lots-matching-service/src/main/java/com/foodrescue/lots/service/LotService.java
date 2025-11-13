package com.foodrescue.lots.service;

import com.foodrescue.lots.dto.LotCreateRequest;
import com.foodrescue.lots.dto.LotUpdateRequest;
import com.foodrescue.lots.entity.Category;
import com.foodrescue.lots.entity.Lot;
import com.foodrescue.lots.entity.Tag;
import com.foodrescue.lots.exception.AccessDeniedException;
import com.foodrescue.lots.exception.LotNotFoundException;
import com.foodrescue.lots.repository.FoodItemRepository;
import com.foodrescue.lots.repository.LotRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

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
        return authMono.zipWith(
                        lotRepository.findById(lotId)
                                .switchIfEmpty(Mono.error(new LotNotFoundException("Lot with ID " + lotId + " not found.")))
                )
                .flatMap(tuple -> {
                    Authentication authentication = tuple.getT1();
                    Lot lot = tuple.getT2();
                    String userId = authentication.getName();
                    Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();

                    boolean isAdmin = authorities.stream()
                            .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ADMIN")
                                    || grantedAuthority.getAuthority().equals("ROLE_ADMIN"));

                    if (isAdmin || lot.getUserId().equals(userId)) {
                        return Mono.just(lot);
                    } else {
                        return Mono.error(new AccessDeniedException("You do not have permission to modify this lot."));
                    }
                });
    }

    private Mono<Authentication> checkCourierRole(Mono<Authentication> authMono) {
        return authMono.flatMap(authentication -> {
            Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();

            boolean isCourier = authorities.stream()
                    .anyMatch(grantedAuthority ->
                            "COURIER".equals(grantedAuthority.getAuthority()) ||
                                    "ROLE_COURIER".equals(grantedAuthority.getAuthority())
                    );

            if (isCourier) {
                return Mono.just(authentication);
            } else {
                return Mono.error(new AccessDeniedException("You must be a COURIER to perform this action."));
            }
        });
    }

    public Mono<Lot> createLot(LotCreateRequest request, String donorId) {
        // Default category if none provided
        Category category = Optional.ofNullable(request.getCategory())
                .orElse(Category.OTHER);

        // Clean + de-dup tags (null-safe)
        List<Tag> tags = Optional.ofNullable(request.getTags())
                .orElseGet(List::of)
                .stream()
                .filter(Objects::nonNull)
                .distinct()
                .limit(3)
                .toList();

        Lot newLot = Lot.builder()
                .lotId(UUID.randomUUID().toString())
                .userId(donorId)
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .addressId(request.getAddressId())
                .totalItems(0)
                .createdAt(Instant.now())
                .status("ACTIVE")
                .category(category)
                .tags(tags)
                .build();

        return lotRepository.save(newLot);
    }

    public Flux<Lot> getAllLotsForAdmin(Mono<Authentication> authMono) {
        return authMono.flatMapMany(authentication -> {
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ADMIN")
                            || grantedAuthority.getAuthority().equals("ROLE_ADMIN"));
            if (isAdmin) {
                return lotRepository.findAll();
            } else {
                return Flux.error(new AccessDeniedException("You must be an admin to view all lots."));
            }
        });
    }

    public Mono<Lot> updateLot(String lotId, LotUpdateRequest request, Mono<Authentication> authMono) {
        return checkLotAdminOrOwnership(lotId, authMono)
                .flatMap(lot -> {
                    // description
                    if (request.getDescription() != null && request.getDescription().isBlank()) {
                        return Mono.error(new IllegalArgumentException("Description cannot be blank."));
                    }
                    if (request.getDescription() != null) {
                        lot.setDescription(request.getDescription());
                    }

                    // status
                    if (request.getStatus() != null) {
                        lot.setStatus(request.getStatus());
                    }

                    // image
                    if (request.getImageUrl() != null) {
                        lot.setImageUrl(request.getImageUrl());
                    }

                    // ✅ NEW: category
                    if (request.getCategory() != null) {
                        lot.setCategory(request.getCategory());
                    }

                    if (request.getTags() != null) {
                        List<Tag> cleaned = request.getTags().stream()
                                .filter(Objects::nonNull)
                                .distinct()
                                .limit(3)
                                .collect(Collectors.toList());
                        lot.setTags(cleaned);
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
                    .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()) || "ADMIN".equals(a.getAuthority()));
            if (isAdmin) {
                return lotRepository.findAll();
            }
            String userId = auth.getName();
            return lotRepository.findByUserId(userId);
        });
    }

    // Methods for Receiver Dashboard

    public Mono<Lot> getLotById(String lotId) {
        return lotRepository.findById(lotId)
                .switchIfEmpty(Mono.error(new LotNotFoundException(
                        "Lot with ID " + lotId + " not found."
                )));
    }

    /**
     * Dashboard-style listing: anyone can see, page/size.
     */
    public Mono<Map<String, Object>> getLotsPaged(int page, int size) {
        int skip = page * size;

        // only OPEN lots
        Mono<List<Lot>> lotsMono = lotRepository.findAll()
                .filter(lot -> "ACTIVE".equalsIgnoreCase(lot.getStatus()))
                .skip(skip)
                .take(size)
                .collectList();

        // total should also count only OPEN lots
        Mono<Long> totalMono = lotRepository.findAll()
                .filter(lot -> "ACTIVE".equalsIgnoreCase(lot.getStatus()))
                .count();

        return Mono.zip(lotsMono, totalMono)
                .map(tuple -> Map.of(
                        "success", true,
                        "page", page,
                        "size", size,
                        "totalElements", tuple.getT2(),
                        "data", tuple.getT1()
                ));
    }

    // changes

    public Mono<Lot> updateLotStatusForCourier(String lotId, String status, Mono<Authentication> authMono) {
        if (status == null || status.isBlank()) {
            return Mono.error(new IllegalArgumentException("Status must not be blank."));
        }

        String normalizedStatus = status.trim().toUpperCase(Locale.ROOT);

        return checkCourierRole(authMono)
                .flatMap(auth ->
                        lotRepository.findById(lotId)
                                .switchIfEmpty(Mono.error(
                                        new LotNotFoundException("Lot with ID " + lotId + " not found.")
                                ))
                                .flatMap(lot -> {
                                    lot.setStatus(normalizedStatus);
                                    return lotRepository.save(lot);
                                })
                );
    }
}
