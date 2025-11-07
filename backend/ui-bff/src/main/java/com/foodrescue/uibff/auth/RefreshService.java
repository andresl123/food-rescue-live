package com.foodrescue.uibff.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class RefreshService {
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private final WebClient authClient;

    public RefreshService(@Qualifier("authClient") WebClient authClient) {
        this.authClient = authClient;
    }

    public Mono<String> refreshTokens(ServerWebExchange exchange, String currentAccessOrNull) {
        var cookie = exchange.getRequest().getCookies().getFirst(Cookies.REFRESH_COOKIE);
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
                .toEntity(String.class)
                .flatMap(entity -> {
                    String body = entity.getBody() == null ? "" : entity.getBody();
                    if (entity.getStatusCode().is2xxSuccessful()) {
                        AuthSessionService.setFromAuthBody(exchange, body);
                        try {
                            JsonNode root = MAPPER.readTree(body);
                            String newAccess = root.path("data").path("accessToken").asText(null);
                            return (newAccess != null && !newAccess.isBlank()) ? Mono.just(newAccess) : Mono.empty();
                        } catch (Exception e) {
                            return Mono.empty();
                        }
                    } else {
                        Cookies.clearAll(exchange);
                        return Mono.empty();
                    }
                });
    }
}
