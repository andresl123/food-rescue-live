package com.foodrescue.auth.config;

import com.foodrescue.auth.service.TokenBlacklistService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.core.*;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class RevokedJwtValidator implements OAuth2TokenValidator<Jwt> {

    private final TokenBlacklistService blacklist;

    public RevokedJwtValidator(TokenBlacklistService blacklist) {
        this.blacklist = blacklist;
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt token) {
        try {
            if (token == null) {
                return OAuth2TokenValidatorResult.failure(
                        new OAuth2Error("invalid_token", "token is null", null));
            }
            final String jti = token.getId(); // may be null if token lacks jti
            final boolean revoked = (jti != null) && blacklist.isRevoked(jti);

            log.debug("RevokedJwtValidator: jti={}, revoked={}", jti, revoked);

            if (revoked) {
                return OAuth2TokenValidatorResult.failure(
                        new OAuth2Error("token_revoked", "JWT has been revoked", null));
            }
            return OAuth2TokenValidatorResult.success();

        } catch (Throwable t) {
            // NEVER bubble exceptions → convert to auth failure (401), not 500
            log.warn("RevokedJwtValidator error: {}", t.toString());
            return OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("validation_error", "revocation check failed", null));
        }
    }
}