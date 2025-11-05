package com.foodrescue.jobs.controller;

import com.foodrescue.jobs.dto.ReserveLotRequest;
import com.foodrescue.jobs.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ReservationResponse> reserve(@RequestBody Mono<ReserveLotRequest> requestMono,
                                             JwtAuthenticationToken authentication) {

        // get receiver_id from JWT "sub"
        String receiverId = authentication.getToken().getSubject(); // this is the `sub`

        return requestMono
                .flatMap(req -> reservationService.reserveLot(req, receiverId))
                .map(r -> new ReservationResponse(r.order(), r.job()));
    }

    public record ReservationResponse(
            Object order,
            Object job
    ) {}
}
