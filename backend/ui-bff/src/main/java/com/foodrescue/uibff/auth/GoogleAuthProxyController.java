package com.foodrescue.uibff.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/google")
public class GoogleAuthProxyController {
    private final WebClient authClient;

    public GoogleAuthProxyController(
            WebClient.Builder builder,
            @Value("${services.auth.base-url}") String authBase
    ) {
        // if authBase is missing, fail fast instead of silently using port 80
        if (authBase == null || authBase.isBlank()) {
            throw new IllegalStateException("services.auth.base-url is not configured");
        }
        this.authClient = builder.baseUrl(authBase).build();
    }

    @PostMapping("/login")
    public Mono<ResponseEntity<String>> googleLogin(@RequestBody String body,
                                                    ServerWebExchange exchange) {
        return authClient.post()
                .uri("/api/v1/google/login")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .exchangeToMono(resp ->
                        resp.bodyToMono(String.class).defaultIfEmpty("")
                                .flatMap(respBody -> {
                                    if (resp.statusCode().is2xxSuccessful()) {
                                        // If tokens exist, set cookies (same as normal login)
                                        String accessToken  = JsonUtils.readString(respBody, "data.accessToken");
                                        String refreshToken = JsonUtils.readString(respBody, "data.refreshToken");

                                        if (accessToken != null && !accessToken.isBlank()
                                                && refreshToken != null && !refreshToken.isBlank()) {
                                            AuthSessionService.setFromAuthBody(exchange, respBody);
                                        }
                                    }

                                    return Mono.just(
                                            ResponseEntity
                                                    .status(resp.statusCode().value())
                                                    .contentType(MediaType.APPLICATION_JSON)
                                                    .body(respBody)
                                    );
                                })
                );
    }


    @PostMapping("/complete")
    public Mono<ResponseEntity<String>> completeSignup(@RequestBody String body,
                                                       ServerWebExchange exchange) {
        return authClient.post()
                .uri("/api/v1/google/complete")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .exchangeToMono(resp ->
                        resp.bodyToMono(String.class).defaultIfEmpty("")
                                .map(respBody -> {
                                    // Always set cookies on successful completion
                                    if (resp.statusCode().is2xxSuccessful()) {
                                        AuthSessionService.setFromAuthBody(exchange, respBody);
                                    }
                                    return ResponseEntity.status(resp.statusCode().value())
                                            .contentType(MediaType.APPLICATION_JSON)
                                            .body(respBody);
                                })
                );
    }
}
