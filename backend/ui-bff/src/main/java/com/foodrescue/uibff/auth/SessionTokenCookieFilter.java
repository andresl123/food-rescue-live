package com.foodrescue.uibff.auth;

import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;

@Component
public class SessionTokenCookieFilter implements WebFilter {

    private static final String SA_ACCESS  = "sa.access_token";
    private static final String SA_REFRESH = "sa.refresh_token";
    private static final String SA_ACCESS_EXP  = "sa.access_exp";
    private static final String SA_REFRESH_EXP = "sa.refresh_exp";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        // Add cookies right before committing the response
        exchange.getResponse().beforeCommit(() ->
                exchange.getSession().flatMap(ws -> {
                    Object access = ws.getAttribute(SA_ACCESS);
                    Object refresh = ws.getAttribute(SA_REFRESH);
                    Instant now = Instant.now();

                    Object accessExp = ws.getAttribute(SA_ACCESS_EXP);
                    Object refreshExp = ws.getAttribute(SA_REFRESH_EXP);

                    if (access instanceof String a && accessExp instanceof Instant ax && ax.isAfter(now)) {
                        addCookie(exchange, "access_token", a, Duration.between(now, ax).getSeconds(), "/");
                    }
                    if (refresh instanceof String r && refreshExp instanceof Instant rx && rx.isAfter(now)) {
                        addCookie(exchange, "refresh_token", r, Duration.between(now, rx).getSeconds(), "/");
                    }
                    return Mono.empty();
                })
        );
        return chain.filter(exchange);
    }

    private static void addCookie(ServerWebExchange exchange, String name, String value, long ttlSec, String path) {
        exchange.getResponse().addCookie(
                ResponseCookie.from(name, value)
                        .httpOnly(true)
                        .secure(false)      // true in prod (HTTPS)
                        .sameSite("Lax")
                        .path(path)
                        .maxAge(Duration.ofSeconds(Math.max(ttlSec, 1))) // never 0
                        .build()
        );
    }
}
