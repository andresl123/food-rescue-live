package com.foodrescue.lots.service;

import com.foodrescue.lots.dto.LotCreateRequest;
import com.foodrescue.lots.entity.Lot;
import com.foodrescue.lots.repository.LotRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Instant;

@Service
public class LotService {

    private final LotRepository lotRepository;

    public LotService(LotRepository lotRepository) {
        this.lotRepository = lotRepository;
    }

    public Mono<Lot> createLot(LotCreateRequest request, String userId) {
        Lot newLot = Lot.builder()
                .userId(userId)
                .description(request.getDescription())
                .totalItems(request.getTotalItems())
                .createdAt(Instant.now())
                .status("OPEN") // Default status for a new lot
                .build();

        return lotRepository.save(newLot);
    }
}