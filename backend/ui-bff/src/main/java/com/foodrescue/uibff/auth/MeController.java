package com.foodrescue.uibff.auth;

import com.nimbusds.jwt.SignedJWT;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.text.ParseException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
public class MeController {

    private static final String ACCESS_COOKIE = "access_token"; // adjust if your cookie name is different

    @GetMapping("/api/me")
    public Mono<ResponseEntity<?>> getMe(ServerWebExchange exchange) {
        var cookie = exchange.getRequest().getCookies().getFirst(ACCESS_COOKIE);
        if (cookie == null) {
            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "access_token cookie missing")));
        }

        String jwt = cookie.getValue();
        try {
            var signed = SignedJWT.parse(jwt);
            var claims = signed.getJWTClaimsSet();

            // Extract fields
            String email = claims.getStringClaim("email");
            if (email == null || email.isBlank()) {
                email = claims.getSubject(); // fallback
            }

            Object rolesObj = claims.getClaim("roles");
            if (rolesObj == null) {
                rolesObj = claims.getClaim("authorities");
            }
            List<?> roles = toList(rolesObj);
            String role = roles.isEmpty() ? null : roles.get(0).toString();

            // New: include userId from sub
            String userId = claims.getSubject();

            return Mono.just(ResponseEntity.ok(Map.of(
                    "userId", userId,
                    "email", email,
                    "role", role
            )));
        } catch (ParseException e) {
            return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "invalid token")));
        }
    }

    private List<?> toList(Object obj) {
        if (obj == null) return Collections.emptyList();
        if (obj instanceof List<?>) return (List<?>) obj;
        if (obj instanceof String s) return List.of(s);
        return Collections.emptyList();
    }
}
