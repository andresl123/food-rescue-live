package com.foodrescue.lots.controller;

import com.foodrescue.lots.dto.LotCreateRequest;
import com.foodrescue.lots.dto.LotUpdateRequest;
import com.foodrescue.lots.dto.UpdateLotStatusRequest;
import com.foodrescue.lots.entity.Lot;
import com.foodrescue.lots.repository.LotRepository;
import com.foodrescue.lots.service.LotService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/lots")
public class LotController {

    private final LotService lotService;
    private final LotRepository lotRepository;

    public LotController(LotService lotService, LotRepository lotRepository) {
        this.lotService = lotService;
        this.lotRepository = lotRepository;
    }

    /** ADMIN can view everything */
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN','RECEIVER')")
    public Flux<Lot> getAllLots(Mono<Authentication> authenticationMono) {
        return lotService.getAllLotsForAdmin(authenticationMono);
    }

    /** ADMIN or DONOR:
     *  - ADMIN → all lots
     *  - DONOR → only their own (service filters)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DONOR')")
    public Flux<Lot> getLotsForPrincipal(Mono<Authentication> authenticationMono) {
        return lotService.getLotsForPrincipal(authenticationMono);
    }

    /** Create: ADMIN or DONOR */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DONOR')")
    public Mono<ResponseEntity<Lot>> createLot(
            @Valid @RequestBody LotCreateRequest request,
            Mono<Authentication> authenticationMono) {
        return authenticationMono
                .map(Authentication::getName)
                .flatMap(userId -> lotService.createLot(request, userId))
                .map(createdLot -> ResponseEntity.status(HttpStatus.CREATED).body(createdLot));
    }

    @GetMapping("/demoforbff")
    @PreAuthorize("hasAnyRole('ADMIN','DONOR')")
    public Mono<String> DemoForBFF() {
        return Mono.just("Demo for BFF from Lots");
    }

    /** Update: ADMIN can update any; DONOR only if owner of {lotId} */
    @PutMapping("/{lotId}")
    @PreAuthorize("hasAnyRole('ADMIN','DONOR')")
    public Mono<ResponseEntity<Lot>> updateLot(
            @PathVariable String lotId,
            @Valid @RequestBody LotUpdateRequest request,
            Mono<Authentication> authenticationMono) {
        return lotService.updateLot(lotId, request, authenticationMono)
                .map(ResponseEntity::ok);
    }

    /** Delete: ADMIN can delete any; DONOR only if owner of {lotId} */
    @DeleteMapping("/{lotId}")
    @PreAuthorize("hasAnyRole('ADMIN','DONOR')")
    public Mono<ResponseEntity<Void>> deleteLot(
            @PathVariable String lotId,
            Mono<Authentication> authenticationMono) {
        return lotService.deleteLot(lotId, authenticationMono)
                .then(Mono.just(ResponseEntity.noContent().build()));
    }

    // Endpoints for the Reciever Dashboard

    @GetMapping("/dashboard")
    public Mono<Map<String, Object>> getLots(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "8") int size
    ) {
        return lotService.getLotsPaged(page, size);
    }

    @GetMapping("/{id}")
    public Mono<Map<String, Object>> getLotById(@PathVariable String id) {
        return lotService.getLotById(id)
                .map(lot -> Map.of(
                        "success", true,
                        "data", lot
                ));
    }

    @PatchMapping("/{lotId}/status")
    public Mono<Lot> updateLotStatus(@PathVariable String lotId,
                                     @RequestBody UpdateLotStatusRequest request) {
        return lotRepository.findById(lotId)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Lot not found")))
                .flatMap(lot -> {
                    lot.setStatus(request.getStatus());
                    return lotRepository.save(lot);
                });
    }

    // changes

    @PatchMapping("/{lotId}/status/ForCourier")
    @PreAuthorize("hasAnyRole('ADMIN','COURIER')")
    public Mono<ResponseEntity<Lot>> updateLotStatusForCourier(
            @PathVariable String lotId,
            @RequestParam("status") String status,
            Mono<Authentication> authenticationMono) {

        return lotService.updateLotStatusForCourier(lotId, status, authenticationMono)
                .map(ResponseEntity::ok);
    }

}
