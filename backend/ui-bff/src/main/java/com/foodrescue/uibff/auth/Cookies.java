package com.foodrescue.uibff.auth;

import org.springframework.http.ResponseCookie;
import org.springframework.web.server.ServerWebExchange;

import java.time.Duration;

public final class Cookies {
    private Cookies() {}

    public static final String REFRESH_COOKIE = "refresh_token";
    public static final String ACCESS_COOKIE  = "access_token";

    public static boolean isSecureRequest(ServerWebExchange exchange) {
        var req = exchange.getRequest();
        String scheme = req.getURI().getScheme();
        if ("https".equalsIgnoreCase(scheme)) return true;

        String xfp = req.getHeaders().getFirst("X-Forwarded-Proto");
        if (xfp != null && xfp.equalsIgnoreCase("https")) return true;

        String cfVisitor = req.getHeaders().getFirst("Cf-Visitor");
        if (cfVisitor != null && cfVisitor.toLowerCase().contains("https")) return true;

        return false;
    }

    public static ResponseCookie clearAccessAtRoot() {
        return ResponseCookie.from(ACCESS_COOKIE, "")
                .httpOnly(true).secure(false).sameSite("Lax")
                .path("/").maxAge(Duration.ZERO).build();
    }

    public static ResponseCookie clearRefreshAtRoot() {
        return ResponseCookie.from(REFRESH_COOKIE, "")
                .httpOnly(true).secure(false).sameSite("Strict")
                .path("/").maxAge(Duration.ZERO).build();
    }

    public static void clearAll(ServerWebExchange exchange) {
        exchange.getResponse().addCookie(clearAccessAtRoot());
        exchange.getResponse().addCookie(clearRefreshAtRoot());
    }
}
