package com.foodrescue.uibff.proxy;

import com.foodrescue.uibff.auth.AuthSessionService;
import com.foodrescue.uibff.auth.Cookies;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/auth")
public class AuthProxyController {

    private final WebClient authClient;
    private final ProxySupport proxy;

    public AuthProxyController(@Qualifier("authClient") WebClient authClient, ProxySupport proxy) {
        this.authClient = authClient;
        this.proxy = proxy;
    }

    /** JSON login → forwards to Auth: POST http://localhost:8080/api/v1/auth/login */
    @PostMapping(path = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> login(@RequestBody String body, ServerWebExchange exchange) {
        return authClient.post()
                .uri("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .exchangeToMono(resp ->
                        resp.bodyToMono(String.class).defaultIfEmpty("")
                                .map(respBody -> {
                                    // Parse Auth JSON and set HttpOnly cookies (access + refresh)
                                    AuthSessionService.setFromAuthBody(exchange, respBody);

                                    return ResponseEntity.status(resp.statusCode().value())
                                            .contentType(MediaType.APPLICATION_JSON)
                                            .body(respBody);
                                })
                );
    }

    /** Logout → forward; always clear cookies locally to be safe */
    @PostMapping("/logout")
    public Mono<ResponseEntity<String>> logout(ServerWebExchange exchange) {
        return authClient.post()
                .uri("/api/v1/auth/logout")
                .headers(h -> {
                    String auth = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
                    if (auth != null && !auth.isBlank()) h.set(HttpHeaders.AUTHORIZATION, auth);
                })
                .exchangeToMono(resp ->
                        resp.bodyToMono(String.class).defaultIfEmpty("")
                                .map(body -> {
                                    // Clear all token cookies (root + scoped)
                                    Cookies.clearAll(exchange);
                                    return ResponseEntity.status(resp.statusCode().value())
                                            .contentType(MediaType.APPLICATION_JSON)
                                            .body(body);
                                })
                )
                .onErrorResume(ex ->
                        Mono.just(ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body("{\"success\":false,\"message\":\"upstream error\"}"))
                );
    }

    @GetMapping("/jwks")
    public Mono<String> jwks(ServerWebExchange exchange) {
        return proxy.forward(
                authClient, HttpMethod.GET, "/.well-known/jwks.json",
                exchange.getRequest().getQueryParams(), null, null, exchange
        );
    }

    @GetMapping("/demoendpoint")
    public Mono<String> demoEndpoint(ServerWebExchange exchange) {
        String auth = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (auth == null || auth.isBlank() || !auth.toLowerCase().startsWith("bearer ")) {
            return Mono.error(new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED, "missing/invalid Authorization header"));
        }
        return authClient.get()
                .uri(uriBuilder -> uriBuilder.path("/demoendpoint")
                        .queryParams(exchange.getRequest().getQueryParams()).build())
                .headers(h -> h.set(HttpHeaders.AUTHORIZATION, auth))
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(String.class)
                .contextWrite(ctx -> ctx.put(ServerWebExchange.class, exchange));
    }
}
