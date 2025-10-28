package com.foodrescue.lots.config;

import com.foodrescue.lots.repository.LotRepository;
import com.foodrescue.security.ownership.OwnershipEvaluator;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/** Tells the RBAC starter how to check if user owns a Lot. */
@Component
public class LotsOwnershipEvaluator implements OwnershipEvaluator {

    private final LotRepository lotRepository;

    public LotsOwnershipEvaluator(LotRepository lotRepository) {
        this.lotRepository = lotRepository;
    }

    @Override
    public Mono<Boolean> owns(String resourceType, String resourceId, String userId) {
        // Only handle LOT resources here (you can expand later if needed)
        if (!"LOT".equalsIgnoreCase(resourceType)) {
            return Mono.just(false);
        }
        // Ownership rule: lot.userId == caller's userId (Authentication.getName())
        return lotRepository.existsByLotIdAndUserId(resourceId, userId);
    }
}
