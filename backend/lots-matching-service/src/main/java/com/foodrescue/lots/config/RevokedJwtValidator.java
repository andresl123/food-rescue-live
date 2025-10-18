package com.foodrescue.lots.config;

import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class RevokedJwtValidator implements OAuth2TokenValidator<Jwt> {

    @Override
    public OAuth2TokenValidatorResult validate(Jwt token) {
        // For now, this validator does nothing and considers all tokens valid.
        // Later, you would add logic here to check if a token's ID (jti)
        // is in a database of revoked tokens.
        boolean isRevoked = false; // Placeholder logic

        if (isRevoked) {
            return OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_token", "This token has been revoked.", null)
            );
        }
        return OAuth2TokenValidatorResult.success();
    }
}