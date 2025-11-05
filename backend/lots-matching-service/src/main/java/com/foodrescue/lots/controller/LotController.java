package com.foodrescue.lots.controller;

import com.foodrescue.lots.dto.LotCreateRequest;
import com.foodrescue.lots.entity.Lot;
import com.foodrescue.lots.repository.LotRepository;
import com.foodrescue.lots.dto.LotUpdateRequest;
import com.foodrescue.lots.service.LotService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;
import org.springframework.web.bind.annotation.GetMapping;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/v1/lots")
public class LotController {

    private final LotService lotService;
    private final LotRepository lotRepository; // Inject LotRepository

    // Update constructor to inject LotRepository
    public LotController(LotService lotService, LotRepository lotRepository) {
        this.lotService = lotService;
        this.lotRepository = lotRepository;
    }

    @GetMapping
    public Flux<Lot> getLotsForDonor(Mono<Authentication> authenticationMono) {
        // Flux is for a stream of 0 to many items (a list)
        return authenticationMono
                .map(Authentication::getName) // Get the logged-in user's ID
                .flatMapMany(lotRepository::findByUserId); // Find all lots for this user
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
    // UPDATE LOT ENDPOINT
    @PutMapping("/{lotId}")
    public Mono<ResponseEntity<Lot>> updateLot(
            @PathVariable String lotId,
            @Valid @RequestBody LotUpdateRequest request,
            Mono<Authentication> authenticationMono) {
        return lotService.updateLot(lotId, request, authenticationMono)
                .map(ResponseEntity::ok) // Return 200 OK with the updated lot
                // Add .onErrorResume() here for specific 403/404 handling if desired
                ;
    }

    // DELETE LOT ENDPOINT
    @DeleteMapping("/{lotId}")
    public Mono<ResponseEntity<Void>> deleteLot(
            @PathVariable String lotId,
            Mono<Authentication> authenticationMono) {

        return lotService.deleteLot(lotId, authenticationMono)
                .then(Mono.just(ResponseEntity.noContent().build()));
    }
}