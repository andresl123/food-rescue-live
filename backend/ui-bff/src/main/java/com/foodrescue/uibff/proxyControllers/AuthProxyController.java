package com.foodrescue.uibff.proxyControllers;

import com.foodrescue.uibff.auth.AuthSessionService;
import com.foodrescue.uibff.auth.Cookies;
import com.foodrescue.uibff.proxy.ProxySupport;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.*;
import org.springframework.util.MultiValueMap;
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

        // Make request to Auth
        return authClient.post()
                .uri("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .exchangeToMono(resp ->
                        resp.bodyToMono(String.class).defaultIfEmpty("")
                                .map(respBody -> {
                                    // Set cookies from Auth JSON (safe – errors swallowed)
                                    AuthSessionService.setFromAuthBody(exchange, respBody);

                                    // Pass Auth's status and body through
                                    return ResponseEntity.status(resp.statusCode().value())
                                            .contentType(MediaType.APPLICATION_JSON)
                                            .body(respBody);
                                })
                );
    }

    /** Logout → forward to auth; cookie clearing is handled by your auth if needed */
    @PostMapping("/logout")
    public Mono<ResponseEntity<String>> logout(ServerWebExchange exchange) {
        return authClient
                .post()
                .uri("/api/v1/auth/logout")
                .headers(h -> {
                    String auth = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
                    if (auth != null && !auth.isBlank()) {
                        h.set(HttpHeaders.AUTHORIZATION, auth);
                    }
                })
                .exchangeToMono(resp ->
                        resp.bodyToMono(String.class).defaultIfEmpty("")
                                .map(body -> {
                                    // Tell the browser to delete the refresh cookie(s)
                                    exchange.getResponse().addCookie(Cookies.clearRefresh());
                                    exchange.getResponse().addCookie(Cookies.clearRefreshAtRoot());

                                    // Pass through auth's status & body
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

    /** Optional: expose JWKS through BFF for same-origin dev convenience */
    @GetMapping("/jwks")
    public Mono<String> jwks(ServerWebExchange exchange) {
        return proxy.forward(
                authClient,
                HttpMethod.GET,
                "/.well-known/jwks.json",
                exchange.getRequest().getQueryParams(),
                null,
                null,
                exchange
        );
    }

    @GetMapping("/demoendpoint")
    public Mono<String> demoGet(ServerWebExchange exchange) {
        return proxy.forward(
                authClient,                          // WebClient with baseUrl = services.auth.base-url
                HttpMethod.GET,                      // upstream method
                "/demoendpoint",                     // upstream path
                exchange.getRequest().getQueryParams(),
                null,                                // no body for GET
                null,                                // let ProxySupport set default content-type
                exchange
        );
    }
}
