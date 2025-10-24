package com.foodrescue.uibff.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Component
public class RefreshService {
    private static final String REFRESH_COOKIE = "refresh_token";
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final WebClient authClient;

    // IMPORTANT: inject the named auth client, not the primary webClient
    public RefreshService(@Qualifier("authClient") WebClient authClient) {
        this.authClient = authClient;
    }

    public Mono<String> refreshAccessToken(ServerWebExchange exchange, String currentAccessOrNull) {
        var cookie = exchange.getRequest().getCookies().getFirst(REFRESH_COOKIE);
        if (cookie == null || cookie.getValue().isBlank()) return Mono.empty();
        String refreshToken = cookie.getValue();

        return authClient.post()
                .uri("/api/v1/auth/refresh")
                .headers(h -> {
                    h.set(HttpHeaders.AUTHORIZATION, "Bearer " + refreshToken);
                    if (currentAccessOrNull != null && !currentAccessOrNull.isBlank()) {
                        h.set("X-Current-Access", currentAccessOrNull); // optional
                    }
                    String cookieHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.COOKIE);
                    if (cookieHeader != null) h.set(HttpHeaders.COOKIE, cookieHeader);
                })
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(String.class)
                .flatMap(body -> {
                    try {
                        JsonNode root = MAPPER.readTree(body);
                        if (!root.path("success").asBoolean(false)) return Mono.empty();
                        JsonNode data = root.path("data");
                        String newAccess = data.path("accessToken").asText(null);

                        String newRefresh = data.path("refreshToken").asText(null);
                        long refreshTtlSec = data.path("refreshExpiresIn").asLong(0);
                        if (newRefresh != null && refreshTtlSec > 0) {
                            exchange.getResponse().addCookie(
                                    ResponseCookie.from(REFRESH_COOKIE, newRefresh)
                                            .httpOnly(true)
                                            .secure(false)     // true in prod (HTTPS)
                                            .sameSite("Lax")
                                            .path("/api/auth")
                                            .maxAge(Duration.ofSeconds(refreshTtlSec))
                                            .build()
                            );
                        }
                        return newAccess != null ? Mono.just(newAccess) : Mono.empty();
                    } catch (Exception e) {
                        return Mono.empty();
                    }
                });
    }
}
