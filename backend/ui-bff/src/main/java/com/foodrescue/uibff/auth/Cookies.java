package com.foodrescue.uibff.auth;

import org.springframework.http.ResponseCookie;

import java.time.Duration;

public final class Cookies {
    private Cookies() {}

    public static final String REFRESH_COOKIE = "refresh_token";
    public static final String ACCESS_COOKIE = "access_token";


    public static ResponseCookie clearRefresh() {
        return ResponseCookie.from(REFRESH_COOKIE, "")
                .httpOnly(true)
                .secure(false)     // set true in prod (HTTPS)
                .sameSite("Lax")
                .path("/api/auth")
                .maxAge(0)
                .build();
    }

    /** Also clear at root, in case it was ever set with "/" path. */
    public static ResponseCookie clearRefreshAtRoot() {
        return ResponseCookie.from(REFRESH_COOKIE, "")
                .httpOnly(true)
                .secure(false)     // set true in prod (HTTPS)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();
    }

    public static ResponseCookie clearAccess() {
        return ResponseCookie.from(REFRESH_COOKIE, "")
                .httpOnly(true)
                .secure(false)     // set true in prod (HTTPS)
                .sameSite("Lax")
                .path("/api/auth")
                .maxAge(0)
                .build();
    }

    public static ResponseCookie clearAccessAtRoot() {
        return ResponseCookie.from(REFRESH_COOKIE, "")
                .httpOnly(true)
                .secure(false)     // set true in prod (HTTPS)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();
    }
}
