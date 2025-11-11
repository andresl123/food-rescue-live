package com.foodrescue.uibff.http;

import com.foodrescue.uibff.auth.Cookies;
import com.foodrescue.uibff.auth.RefreshService;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.time.Duration;
import java.util.Date;

/**
 * Runs BEFORE Spring Security. If the access token is missing, expired, or expiring soon,
 * use the refresh cookie to rotate tokens so Spring Security sees a fresh access token.
 */

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 20)
@RequiredArgsConstructor
public class ProactiveRefreshWebFilter implements WebFilter {

    private static final long REFRESH_BEFORE_MILLIS = Duration.ofMinutes(8).toMillis();

    private final RefreshService refreshService;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
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

        // from here we have an access token
        String accessToken = accessCookie.getValue();
        Date exp = getExpiry(accessToken);

        // if token can't be parsed → treat as unauthorized
        if (exp == null) {
            return unauthorized(exchange);
        }

        long now = System.currentTimeMillis();
        long millisLeft = exp.getTime() - now;

        // 3) if access is still good for > 8 minutes → just continue
        if (millisLeft > REFRESH_BEFORE_MILLIS) {
            return chain.filter(exchange);
        }

        // 4) access is expiring soon → we MUST have refresh, otherwise 401
        if (refreshCookie == null) {
            return unauthorized(exchange);
        }

        // 5) call your existing refreshService
        return refreshService.refreshTokens(exchange, accessToken)
                .flatMap(newAccess -> chain.filter(exchange))
                .switchIfEmpty(Mono.defer(() -> {
                    // refresh endpoint said no / non-2xx
                    clearRefresh(exchange);
                    return unauthorized(exchange);
                }))
                .onErrorResume(ex -> {
                    // network / parsing / auth error
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
        var res = exchange.getResponse();
        res.setStatusCode(HttpStatus.UNAUTHORIZED);
        res.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        byte[] body = "{\"error\":\"unauthorized\"}".getBytes(StandardCharsets.UTF_8);
        return res.writeWith(Mono.just(res.bufferFactory().wrap(body)));
    }
}

