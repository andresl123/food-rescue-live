package com.foodrescue.uibff.http;

import com.foodrescue.uibff.auth.Cookies;
import com.foodrescue.uibff.auth.RefreshService;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.*;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.time.Duration;
import java.util.Date;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 20)
@RequiredArgsConstructor
public class ProactiveRefreshWebFilter implements WebFilter {

    private static final long REFRESH_BEFORE_MILLIS = Duration.ofMinutes(8).toMillis();
    private final RefreshService refreshService;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {

        // 0) let preflight and auth endpoints pass untouched
        String path = exchange.getRequest().getURI().getPath();
        HttpMethod method = exchange.getRequest().getMethod();
        if (method == HttpMethod.OPTIONS ||
                path.startsWith("/api/auth/")) {
            return chain.filter(exchange);
        }

        var cookies = exchange.getRequest().getCookies();
        var accessCookie = cookies.getFirst(Cookies.ACCESS_COOKIE);
        var refreshCookie = cookies.getFirst(Cookies.REFRESH_COOKIE);

        // 1) no access & no refresh → 401
        if (accessCookie == null && refreshCookie == null) {
            return unauthorized(exchange);
        }

        // 2) no access but has refresh → delete refresh, 401
        if (accessCookie == null) {
            clearRefresh(exchange);
            return unauthorized(exchange);
        }

        // 3) we have access → check exp
        String accessToken = accessCookie.getValue();
        Date exp = getExpiry(accessToken);
        if (exp == null) {
            return unauthorized(exchange);
        }

        long now = System.currentTimeMillis();
        long millisLeft = exp.getTime() - now;

        // still valid for > 8 minutes → ok
        if (millisLeft > REFRESH_BEFORE_MILLIS) {
            return chain.filter(exchange);
        }

        // expiring soon → we need refresh
        if (refreshCookie == null) {
            return unauthorized(exchange);
        }

        return refreshService.refreshTokens(exchange, accessToken)
                .flatMap(newAccess -> chain.filter(exchange))
                .switchIfEmpty(Mono.defer(() -> {
                    clearRefresh(exchange);
                    return unauthorized(exchange);
                }))
                .onErrorResume(e -> {
                    clearRefresh(exchange);
                    return unauthorized(exchange);
                });
    }

    private Date getExpiry(String jwt) {
        try {
            SignedJWT signed = SignedJWT.parse(jwt);
            var claims = signed.getJWTClaimsSet();
            return claims == null ? null : claims.getExpirationTime();
        } catch (ParseException e) {
            return null;
        }
    }

    private void clearRefresh(ServerWebExchange exchange) {
        exchange.getResponse().addCookie(
                ResponseCookie.from(Cookies.REFRESH_COOKIE, "")
                        .httpOnly(true)
                        .path("/")
                        .maxAge(0)
                        .build()
        );
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        ServerHttpResponse res = exchange.getResponse();
        res.setStatusCode(HttpStatus.UNAUTHORIZED);
        res.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        // add CORS here because we might be returning before Spring’s CORS filter
        res.getHeaders().setAccessControlAllowOrigin("http://localhost:5173");
        res.getHeaders().setAccessControlAllowCredentials(true);

        byte[] body = "{\"error\":\"unauthorized\"}".getBytes(StandardCharsets.UTF_8);
        return res.writeWith(Mono.just(res.bufferFactory().wrap(body)));
    }
}
