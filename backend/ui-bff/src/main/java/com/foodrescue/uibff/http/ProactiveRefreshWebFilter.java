package com.foodrescue.uibff.http;

import com.foodrescue.uibff.auth.Cookies;
import com.foodrescue.uibff.auth.RefreshService;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.text.ParseException;
import java.util.Date;

/**
 * Runs BEFORE Spring Security. If the access token is missing, expired, or expiring soon,
 * use the refresh cookie to rotate tokens so Spring Security sees a fresh access token.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ProactiveRefreshWebFilter implements WebFilter {

    // Refresh if access token has <= 15s remaining (tweak as you like)
    private static final long REFRESH_THRESHOLD_SECONDS = 300;

    private final RefreshService refreshService;

    public ProactiveRefreshWebFilter(RefreshService refreshService) {
        this.refreshService = refreshService;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        var accessC  = exchange.getRequest().getCookies().getFirst(Cookies.ACCESS_COOKIE);
        var refreshC = exchange.getRequest().getCookies().getFirst(Cookies.REFRESH_COOKIE);

        // If we don’t even have a refresh cookie, nothing to do.
        if (refreshC == null || isBlank(refreshC.getValue())) {
            return chain.filter(exchange);
        }

        // Case A: no access cookie at all -> refresh now (first request after idle)
        if (accessC == null || isBlank(accessC.getValue())) {
            return refreshService.refreshTokens(exchange, null).then(chain.filter(exchange));
        }

        // Case B/C: access token exists, check expiry
        String access = accessC.getValue();
        Date exp = readExp(access);
        if (exp == null) {
            // Unparsable token → try refresh (may be opaque or malformed)
            return refreshService.refreshTokens(exchange, null).then(chain.filter(exchange));
        }

        long secondsLeft = (exp.getTime() - System.currentTimeMillis()) / 1000L;
        if (secondsLeft <= REFRESH_THRESHOLD_SECONDS) {
            // Expired or about to expire → refresh
            return refreshService.refreshTokens(exchange, "Bearer " + access)
                    .then(chain.filter(exchange));
        }

        // Token is healthy, continue
        return chain.filter(exchange);
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private static Date readExp(String jwt) {
        try {
            SignedJWT parsed = SignedJWT.parse(jwt);
            JWTClaimsSet claims = parsed.getJWTClaimsSet();
            return claims == null ? null : claims.getExpirationTime();
        } catch (ParseException e) {
            return null;
        }
    }
}
