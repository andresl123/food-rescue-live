package com.foodrescue.uibff.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseCookie;
import org.springframework.web.server.ServerWebExchange;

import java.time.Duration;

public final class AuthSessionService {
    private AuthSessionService() {}

    public static final String ACCESS_COOKIE  = "access_token";
    public static final String REFRESH_COOKIE = Cookies.REFRESH_COOKIE; // "refresh_token"

    private static final ObjectMapper MAPPER = new ObjectMapper();

    /** Clear both access & refresh cookies (root + /api/auth just in case). */
    public static void clearAll(ServerWebExchange exchange) {
        exchange.getResponse().addCookie(
                ResponseCookie.from(ACCESS_COOKIE, "")
                        .httpOnly(true).secure(false).sameSite("Lax")
                        .path("/").maxAge(Duration.ZERO).build());

        // refresh on root
        exchange.getResponse().addCookie(
                ResponseCookie.from(REFRESH_COOKIE, "")
                        .httpOnly(true).secure(false).sameSite("Lax")
                        .path("/").maxAge(Duration.ZERO).build());

        // refresh on /api/auth scope (if previously set there)
        exchange.getResponse().addCookie(Cookies.clearRefresh());
    }

    /** Set cookies from raw JSON body returned by Auth (expects data.{accessToken,accessExpiresIn,refreshToken,refreshExpiresIn}). */
    public static void setFromAuthBody(ServerWebExchange exchange, String jsonBody) {
        try {
            JsonNode root = MAPPER.readTree(jsonBody);
            JsonNode data = root.path("data");

            final String access  = data.path("accessToken").asText(null);
            final long   accTtl  = data.path("accessExpiresIn").asLong(0);
            final String refresh = data.path("refreshToken").asText(null);
            final long   refTtl  = data.path("refreshExpiresIn").asLong(0);

            if (access != null && accTtl > 0) {
                exchange.getResponse().addCookie(
                        ResponseCookie.from(ACCESS_COOKIE, access)
                                .httpOnly(true)      // HttpOnly so JS can't read it
                                .secure(false)       // true in prod (HTTPS)
                                .sameSite("Lax")
                                .path("/")           // send to whole site
                                .maxAge(Duration.ofSeconds(accTtl))
                                .build()
                );
            }

            if (refresh != null && refTtl > 0) {
                exchange.getResponse().addCookie(
                        ResponseCookie.from(REFRESH_COOKIE, refresh)
                                .httpOnly(true)
                                .secure(false)       // true in prod (HTTPS)
                                .sameSite("Lax")
                                .path("/api/auth")   // limit scope to auth routes
                                .maxAge(Duration.ofSeconds(refTtl))
                                .build()
                );
            }
        } catch (Exception ignore) {
            // don't break the response if parsing fails
        }
    }
}
