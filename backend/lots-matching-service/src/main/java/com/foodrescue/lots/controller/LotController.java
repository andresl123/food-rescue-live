package com.foodrescue.lots.controller;

import com.foodrescue.lots.dto.LotCreateRequest;
import com.foodrescue.lots.entity.Lot;
import com.foodrescue.lots.service.LotService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/lots")
public class LotController {

    private final LotService lotService;

    public LotController(LotService lotService) {
        this.lotService = lotService;
    }

    @PostMapping
    public Mono<ResponseEntity<Lot>> createLot(
            @Valid @RequestBody LotCreateRequest request,
            Mono<Authentication> authenticationMono) {

        // Extracts the donor's ID (the 'sub' claim) from the validated JWT token
        return authenticationMono
                .map(Authentication::getName)
                .flatMap(userId -> lotService.createLot(request, userId))
                .map(createdLot -> ResponseEntity.status(HttpStatus.CREATED).body(createdLot));
    }
}