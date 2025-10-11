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
            String jti = token.getId(); // JWT ID
            boolean revoked = (jti != null && blacklist.isRevoked(jti));
            log.debug("RevokedJwtValidator: jti={}, revoked={}", jti, revoked);
            if (revoked) {
                return OAuth2TokenValidatorResult.failure(
                        new OAuth2Error("token_revoked", "JWT has been revoked", null));
            }
            return OAuth2TokenValidatorResult.success();
        } catch (Exception e) {
            log.warn("RevokedJwtValidator threw: {}", e.toString());
            return OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("validation_error", "validator_error", null));
        }
    }
}