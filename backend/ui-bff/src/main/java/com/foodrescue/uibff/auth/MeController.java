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

    private static final String ACCESS_COOKIE = "access_token"; // must match your auth cookie

    @GetMapping("/api/me")
    public Mono<ResponseEntity<?>> getMe(ServerWebExchange exchange) {
        var cookie = exchange.getRequest().getCookies().getFirst(ACCESS_COOKIE);
        if (cookie == null) {
            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "access_token cookie missing")));
        }

        String jwt = cookie.getValue();
        try {
            SignedJWT signed = SignedJWT.parse(jwt);
            var claims = signed.getJWTClaimsSet();

            // sub is your user id
            String userId = claims.getSubject();

            // email is in the token, but fall back to sub
            String email = claims.getStringClaim("email");
            if (email == null || email.isBlank()) {
                email = userId;
            }

            // roles can be an array or a single string depending on issuer
            Object rolesObj = claims.getClaim("roles");
            if (rolesObj == null) {
                rolesObj = claims.getClaim("authorities");
            }
            List<?> roles = toList(rolesObj);
            // keep role as STRING
            String role = roles.isEmpty() ? null : String.valueOf(roles.get(0));

            return Mono.just(ResponseEntity.ok(
                    Map.of(
                            "userId", userId,
                            "email", email,
                            "role", role
                    )
            ));
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
