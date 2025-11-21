package com.foodrescue.auth.controller;

import com.foodrescue.auth.entity.Address;
import com.foodrescue.auth.entity.User;
import com.foodrescue.auth.repository.AddressRepository;
import com.foodrescue.auth.repository.UserRepository;
import com.foodrescue.auth.service.GoogleAuthService;
import com.foodrescue.auth.service.JwtService;
import com.foodrescue.auth.web.request.CompleteGoogleSignupRequest;
import com.foodrescue.auth.web.response.ApiResponse;
import com.foodrescue.auth.web.response.GoogleLoginResponse;
import com.foodrescue.auth.web.response.TokenResponse;
import jakarta.validation.Valid;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/google")
public class GoogleAuthController {
    private final UserRepository users;
    private final AddressRepository addresses;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final GoogleAuthService googleAuthService;

    public GoogleAuthController(
            UserRepository users,
            AddressRepository addresses,
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            GoogleAuthService googleAuthService
    ) {
        this.users = users;
        this.addresses = addresses;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.googleAuthService = googleAuthService;
    }

    @PostMapping("/login")
    public Mono<ApiResponse<Map<String, Object>>> googleLogin(@RequestBody Map<String, String> body) {
        String idToken = body.get("credential");
        if (idToken == null || idToken.isBlank()) {
            return Mono.just(new ApiResponse<>(false, null, "Missing credential"));
        }

        // Optional: local test shortcut (keep or remove as you like)
        if ("TEST_TOKEN".equals(idToken)) {
            String email = "postman-google@test.com";
            String name  = "Postman Google User";
            return handleGoogleLoginForEmail(email, name);
        }

        // Real Google flow
        return googleAuthService.verify(idToken)
                .flatMap(payload -> {
                    String email = payload.get("email");
                    String name  = payload.get("name");
                    return handleGoogleLoginForEmail(email, name);
                })
                .onErrorResume(ex -> Mono.just(new ApiResponse<>(false, null, ex.getMessage())));
    }

    /**
     * Shared logic:
     *  - If user doesn't exist → create INCOMPLETE user and return { newUser, userId, email, name }
     *  - If user exists with status INCOMPLETE → treat as newUser again (no tokens yet)
     *  - If user exists with status ACTIVE → return tokens in the flat format you requested
     *  - Any other status → "User is disabled"
     */
    private Mono<ApiResponse<Map<String, Object>>> handleGoogleLoginForEmail(String email, String name) {
        return users.findByEmail(email)
                .flatMap(existing -> {
                    String status = existing.getStatus() == null
                            ? ""
                            : existing.getStatus().toUpperCase();

                    // 1) Provisional Google user who hasn't completed signup
                    if ("INCOMPLETE".equals(status)) {
                        Map<String, Object> data = Map.of(
                                "newUser", true,
                                "userId", existing.getId(),
                                "email", existing.getEmail(),
                                "name", existing.getName()
                        );
                        return Mono.just(new ApiResponse<>(true, data, null));
                    }

                    // 2) Only ACTIVE users can log in and get tokens
                    if (!"ACTIVE".equals(status)) {
                        return Mono.error(new IllegalArgumentException("User is disabled"));
                    }

                    // 3) Existing ACTIVE user → return tokens in flat shape
                    String access  = jwtService.createAccessToken(existing);
                    String refresh = jwtService.createRefreshToken(existing);
                    jwtService.registerRefresh(refresh);

                    Map<String, Object> data = Map.of(
                            "accessToken", access,
                            "accessExpiresIn", jwtService.getAccessTtlSeconds(),
                            "refreshToken", refresh,
                            "refreshExpiresIn", jwtService.getRefreshTtlSeconds()
                    );

                    return Mono.just(new ApiResponse<>(true, data, null));
                })
                .switchIfEmpty(Mono.defer(() -> {
                    // 4) No user yet → create provisional INCOMPLETE user
                    User provisional = User.builder()
                            .name(name)
                            .email(email)
                            .password("google")
                            .categoryId("GOOGLE")
                            .roles(Set.of("GOOGLE"))
                            .status("INCOMPLETE")
                            .build();

                    return users.save(provisional)
                            .map(saved -> {
                                Map<String, Object> data = Map.of(
                                        "newUser", true,
                                        "userId", saved.getId(),
                                        "email", saved.getEmail(),
                                        "name", saved.getName()
                                );
                                return new ApiResponse<>(true, data, null);
                            });
                }));
    }


    /** Finalise a provisional signup by setting password/role/phone/address. */
    @PostMapping("/complete")
    public Mono<ApiResponse<TokenResponse>> completeSignup(@Valid @RequestBody CompleteGoogleSignupRequest req) {
        return users.findById(req.userId())
                .switchIfEmpty(Mono.error(new IllegalArgumentException("User not found")))
                .flatMap(user -> {
                    user.setPassword(passwordEncoder.encode(req.password()));
                    user.setCategoryId(req.categoryId());
                    user.setPhoneNumber(req.phoneNumber());
                    user.setRoles(Set.of(req.categoryId()));
                    user.setStatus("ACTIVE");
                    return users.save(user)
                            .flatMap(savedUser -> {
                                Address addr = new Address();
                                addr.setStreet(req.street());
                                addr.setCity(req.city());
                                addr.setState(req.state());
                                addr.setPostalCode(req.postalCode());
                                addr.setCountry(req.country());
                                return addresses.save(addr)
                                        .flatMap(savedAddr -> {
                                            savedUser.setDefaultAddressId(savedAddr.getId());
                                            return users.save(savedUser);
                                        });
                            })
                            .flatMap(finalUser -> {
                                String access  = jwtService.createAccessToken(finalUser);
                                String refresh = jwtService.createRefreshToken(finalUser);
                                jwtService.registerRefresh(refresh);
                                TokenResponse tokens = new TokenResponse(
                                        access, jwtService.getAccessTtlSeconds(),
                                        refresh, jwtService.getRefreshTtlSeconds());
                                return Mono.just(new ApiResponse<>(true, tokens, null));
                            });
                })
                .onErrorResume(ex -> Mono.just(new ApiResponse<>(false, null, ex.getMessage())));
    }
}
