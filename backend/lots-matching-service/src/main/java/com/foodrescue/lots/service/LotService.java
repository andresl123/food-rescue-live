package com.foodrescue.lots.service;

import com.foodrescue.lots.dto.LotCreateRequest;
import com.foodrescue.lots.entity.Lot;
import com.foodrescue.lots.repository.LotRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.UUID;

@Service
public class LotService {

    private final LotRepository lotRepository;

    public LotService(LotRepository lotRepository) {
        this.lotRepository = lotRepository;
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
}