package com.foodrescue.uibff.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseCookie;
import org.springframework.web.server.ServerWebExchange;

import java.time.Duration;

public final class AuthSessionService {
    private AuthSessionService() {}

    public static final String ACCESS_COOKIE  = Cookies.ACCESS_COOKIE;
    public static final String REFRESH_COOKIE = Cookies.REFRESH_COOKIE;

    private static final ObjectMapper MAPPER = new ObjectMapper();

    public static void setFromAuthBody(ServerWebExchange exchange, String jsonBody) {
        try {
            JsonNode root = MAPPER.readTree(jsonBody);
            JsonNode data = root.path("data");

            String access  = data.path("accessToken").asText(null);
            long   accTtl  = data.path("accessExpiresIn").asLong(0);
            String refresh = data.path("refreshToken").asText(null);
            long   refTtl  = data.path("refreshExpiresIn").asLong(0);

            boolean secure = Cookies.isSecureRequest(exchange);

            if (access != null && accTtl > 0) {
                exchange.getResponse().addCookie(
                        ResponseCookie.from(ACCESS_COOKIE, access)
                                .httpOnly(true).secure(secure)
                                .sameSite("Lax").path("/")
                                .maxAge(Duration.ofSeconds(accTtl)).build()
                );
            }
            if (refresh != null && refTtl > 0) {
                exchange.getResponse().addCookie(
                        ResponseCookie.from(REFRESH_COOKIE, refresh)
                                .httpOnly(true).secure(secure)
                                .sameSite("Strict").path("/") // allow 401-filter anywhere
                                .maxAge(Duration.ofSeconds(refTtl)).build()
                );
            }
        } catch (Exception ignore) { }
    }
}
