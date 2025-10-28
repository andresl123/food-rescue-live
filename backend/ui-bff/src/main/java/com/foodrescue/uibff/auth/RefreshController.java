package com.foodrescue.uibff.auth;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
public class RefreshController {

    private final WebClient authClient;

    public RefreshController(@Qualifier("authClient") WebClient authClient) {
        this.authClient = authClient;
    }

    @PostMapping(path = "/api/auth/refresh", consumes = MediaType.ALL_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> refresh(ServerWebExchange exchange) {
        var c = exchange.getRequest().getCookies().getFirst(Cookies.REFRESH_COOKIE);
        String rt = (c == null) ? null : c.getValue();
        if (rt == null || rt.isBlank()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "missing refresh token");
        }

        return authClient.post()
                .uri("/api/v1/auth/refresh")
                .headers(h -> {
                    h.set(HttpHeaders.AUTHORIZATION, "Bearer " + rt);
                    String cookieHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.COOKIE);
                    if (cookieHeader != null) h.set(HttpHeaders.COOKIE, cookieHeader);
                })
                .accept(MediaType.APPLICATION_JSON)
                .exchangeToMono(resp -> resp.bodyToMono(String.class).defaultIfEmpty("")
                        .map(body -> {
                            if (resp.statusCode().is2xxSuccessful()) {
                                AuthSessionService.setFromAuthBody(exchange, body);
                            } else if (resp.statusCode().is4xxClientError()) {
                                Cookies.clearAll(exchange);
                            }
                            return ResponseEntity.status(resp.statusCode().value())
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .body(body);
                        })
                );
    }
}
