package com.foodrescue.auth.controller;

import com.foodrescue.auth.repository.UserRepository;
import com.foodrescue.auth.service.JwtService;
import com.foodrescue.auth.service.TokenBlacklistService;
import com.foodrescue.auth.web.request.LoginRequest;
import com.foodrescue.auth.web.response.ApiResponse;
import com.foodrescue.auth.web.response.TokenResponse;
import com.nimbusds.jwt.SignedJWT;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.text.ParseException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository users;
    private final JwtService jwt;
    private final TokenBlacklistService blacklistService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository users,
                          JwtService jwt,
                          TokenBlacklistService blacklistService,
                          PasswordEncoder passwordEncoder) {
        this.users = users;
        this.jwt = jwt;
        this.blacklistService = blacklistService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public Mono<ApiResponse<TokenResponse>> login(@Valid @RequestBody LoginRequest req) {
        String email = req.email().trim().toLowerCase();
        return users.findByEmail(email)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Invalid credentials")))
                .flatMap(u ->
                        Mono.fromCallable(() -> passwordEncoder.matches(req.password(), u.getPassword()))
                                .subscribeOn(Schedulers.boundedElastic())
                                .flatMap(matches -> {
                                    if (!matches) return Mono.error(new IllegalArgumentException("Invalid credentials"));
                                    if (!"ACTIVE".equalsIgnoreCase(u.getStatus()))
                                        return Mono.error(new IllegalArgumentException("User is disabled"));

                                    String access  = jwt.createAccessToken(u);
                                    String refresh = jwt.createRefreshToken(u);
                                    // Make refresh usable by /refresh
                                    jwt.registerRefresh(refresh);

                                    return Mono.just(ApiResponse.ok(
                                            new TokenResponse(
                                                    access,  jwt.getAccessTtlSeconds(),
                                                    refresh, jwt.getRefreshTtlSeconds()
                                            )
                                    ));
                                })
                );
    }

    /** Exchange a valid refresh token for a new access+refresh pair (rotation).
     *  Send refresh in Authorization header: "Bearer <refreshToken>"
     */
    @PostMapping("/refresh")
    public Mono<ApiResponse<TokenResponse>> refresh(@RequestHeader(HttpHeaders.AUTHORIZATION) String auth) {
        if (auth == null || !auth.startsWith("Bearer ")) {
            return Mono.error(new IllegalArgumentException("Missing refresh token"));
        }
        String refresh = auth.substring(7).trim();
        try {
            var parsed = SignedJWT.parse(refresh);
            var claims = parsed.getJWTClaimsSet();
            if (!"refresh".equals(claims.getStringClaim("typ"))) {
                return Mono.error(new IllegalArgumentException("Not a refresh token"));
            }

            String rti = claims.getJWTID();
            if (!jwt.isRefreshValid(rti)) {
                return Mono.error(new IllegalArgumentException("Refresh token invalid/expired"));
            }

            String userId = claims.getSubject();
            return users.findById(userId)
                    .switchIfEmpty(Mono.error(new IllegalArgumentException("User not found")))
                    .flatMap(u -> {
                        if (!"ACTIVE".equalsIgnoreCase(u.getStatus()))
                            return Mono.error(new IllegalArgumentException("User is disabled"));

                        // rotate refresh, mint new access
                        String newRefresh = jwt.rotateRefresh(u, rti);
                        String newAccess  = jwt.createAccessToken(u);

                        return Mono.just(ApiResponse.ok(
                                new TokenResponse(
                                        newAccess,  jwt.getAccessTtlSeconds(),
                                        newRefresh, jwt.getRefreshTtlSeconds()
                                )
                        ));
                    });
        } catch (Exception e) {
            return Mono.error(new IllegalArgumentException("Invalid refresh token"));
        }
    }

    @PostMapping("/logout")
    public Mono<ResponseEntity<Map<String, Object>>> logout(
            @RequestHeader(HttpHeaders.AUTHORIZATION) Optional<String> authHeader,
            @RequestHeader(value = "X-Refresh-Token", required = false) String refreshOpt) {

        return Mono.fromCallable(() -> {
                    String accessToken = null;
                    Instant accessExp = null;
                    String accessJti = null;

                    // Extract Bearer access token if present
                    String header = authHeader.orElse("");
                    if (header.startsWith("Bearer ")) {
                        accessToken = header.substring(7).trim();
                        try {
                            var parsed = SignedJWT.parse(accessToken);
                            var claims = parsed.getJWTClaimsSet();
                            accessJti = claims.getJWTID();
                            var exp = claims.getExpirationTime();
                            if (exp != null) accessExp = exp.toInstant();
                        } catch (ParseException ignored) {}
                    }

                    // Revoke access token (blacklist by jti until exp)
                    if (accessJti != null && accessExp != null) {
                        // e.g., store jti -> expEpochSeconds in Redis/set
                        blacklistService.revoke(accessJti, accessExp.getEpochSecond());
                    }

                    // Revoke refresh immediately if provided
                    String refreshToken = (refreshOpt != null && !refreshOpt.isBlank()) ? refreshOpt.trim() : null;
                    if (refreshToken != null) {
                        try {
                            var parsedR = SignedJWT.parse(refreshToken);
                            var rti = parsedR.getJWTClaimsSet().getJWTID();
                            if (rti != null) {
                                jwt.revokeRefresh(rti); // your refresh revocation store
                            }
                        } catch (Exception ignored) {}
                    }

                    // Build response body echoing tokens + status
                    Map<String, Object> body = new LinkedHashMap<>();
                    body.put("status", "Logout");
                    body.put("revoked_at", Instant.now().toString());
                    if (accessToken != null) {
                        body.put("access_token", accessToken);
                        if (accessExp != null) body.put("access_expires_at", accessExp.toString());
                    }
                    if (refreshToken != null) {
                        body.put("refresh_token", refreshToken);
                    }

                    return ResponseEntity.ok(body);
                })
                .subscribeOn(Schedulers.boundedElastic());
    }

    // ---- DEV-ONLY: check if a jti is blacklisted ----
    @GetMapping("/_debug/blacklist")
    public Mono<ResponseEntity<Map<String, Object>>> debugBlacklist(@RequestParam String jti) {
        boolean revoked = blacklistService.isRevoked(jti); // may remove if expired
        Long storedExp = blacklistService.getExpiryEpoch(jti); // null if not present
        long now = Instant.now().getEpochSecond();

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("jti", jti);
        body.put("revoked", revoked);
        body.put("storedExp", storedExp);
        body.put("nowEpoch", now);
        body.put("deltaSeconds", storedExp == null ? null : (storedExp - now));
        return Mono.just(ResponseEntity.ok(body));
    }

    @GetMapping("/secure/ping")
    public Map<String, String> ping() { return Map.of("ok","true"); }
}