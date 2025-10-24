package com.foodrescue.uibff.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Duration;

@RestController
public class RefreshController {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    /** Must match the cookie name you set on login */
    private final WebClient authClient;

    public RefreshController(@Qualifier("authClient") WebClient authClient) {
        this.authClient = authClient;
    }

    /**
     * POST /api/auth/refresh
     * - Reads refresh_token from cookie
     * - Calls Auth: POST /api/v1/auth/refresh with header "Authorization: Bearer <refresh_token>"
     * - Returns Auth's body as-is (Mono&lt;String&gt;), similar to your login proxy.
     */
    @PostMapping(path = "/api/auth/refresh", consumes = MediaType.ALL_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<String> refresh(ServerWebExchange exchange) {
        String rt = readCookie(exchange, Cookies.REFRESH_COOKIE);
        if (rt == null || rt.isBlank()) {
            // Keep method signature Mono<String> like login; surface 400 via exception
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "missing refresh token");
        }

        return authClient
                .post()
                .uri("/api/v1/auth/refresh")
                .headers(h -> {
                    // EXACT header name, no trailing space
                    h.set(HttpHeaders.AUTHORIZATION, "Bearer " + rt);
                })
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(String.class)
                // Optional: if Auth returns rotated refresh token, update cookie
                .doOnNext(body -> updateCookieIfRotated(exchange, body))
                // Propagate the exchange so any filters can still see it
                .contextWrite(ctx -> ctx.put(ServerWebExchange.class, exchange));
    }

    // ---- helpers ------------------------------------------------------------

    private String readCookie(ServerWebExchange exchange, String Cookie_name) {
        var c = exchange.getRequest().getCookies().getFirst(Cookie_name);
        return (c == null) ? null : c.getValue();
    }

    /** Tries to parse {"data":{"refreshToken":"...","refreshExpiresIn":123}} and rotate cookie. */
    private void updateCookieIfRotated(ServerWebExchange exchange, String body) {
        try {
            JsonNode root = MAPPER.readTree(body);
            JsonNode data = root.path("data");
            String newRt = data.path("refreshToken").asText(null);
            long ttlSec = data.path("refreshExpiresIn").asLong(0);
            if (newRt != null && ttlSec > 0) {
                exchange.getResponse().addCookie(
                        ResponseCookie.from(Cookies.REFRESH_COOKIE, newRt)
                                .httpOnly(true)
                                .secure(false)        // set true behind HTTPS in prod
                                .sameSite("Lax")
                                .path("/api/auth")    // keep it scoped to BFF auth routes
                                .maxAge(Duration.ofSeconds(ttlSec))
                                .build()
                );
            }
        } catch (Exception ignore) {

        }
    }
}
