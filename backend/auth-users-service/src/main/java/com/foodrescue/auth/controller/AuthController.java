package com.foodrescue.auth.controller;

import com.foodrescue.auth.auth.JwtService;
import com.foodrescue.auth.repository.UserRepository;
import com.foodrescue.auth.web.request.LoginRequest;
import com.foodrescue.auth.web.response.ApiResponse;
import com.foodrescue.auth.web.response.TokenResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository users;
    private final JwtService jwt;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository users, JwtService jwt) {
        this.users = users;
        this.jwt = jwt;
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public Mono<ApiResponse<TokenResponse>> login(@Valid @RequestBody LoginRequest req) {
        return users.findByEmail(req.email().toLowerCase())
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Invalid credentials")))
                .flatMap(u ->
                        Mono.fromCallable(() -> encoder.matches(req.password(), u.getPassword()))
                                .subscribeOn(Schedulers.boundedElastic())
                                .flatMap(matches -> {
                                    if (!matches) return Mono.error(new IllegalArgumentException("Invalid credentials"));
                                    if (!"ACTIVE".equalsIgnoreCase(u.getStatus()))
                                        return Mono.error(new IllegalArgumentException("User is disabled"));
                                    String token = jwt.createAccessToken(u);
                                    return Mono.just(ApiResponse.ok(new TokenResponse(token, jwt.getAccessTtlSeconds())));
                                })
                );
    }
}
