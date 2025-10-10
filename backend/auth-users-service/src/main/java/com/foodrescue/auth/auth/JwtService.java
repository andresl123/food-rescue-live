package com.foodrescue.auth.auth;

import com.foodrescue.auth.crypto.KeyProvider;
import com.foodrescue.auth.entity.User;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;

@Getter
@Setter
@Service
public class JwtService {

    private final KeyProvider keyProvider;
    private final String issuer;
    private final String audience;
    private final long accessTtlSeconds;

    public JwtService(
            KeyProvider keyProvider,
            @Value("${jwt.issuer}") String issuer,
            @Value("${jwt.audience}") String audience,
            @Value("${jwt.access-ttl-seconds:900}") long accessTtlSeconds) {
        this.keyProvider = keyProvider;
        this.issuer = issuer;
        this.audience = audience;
        this.accessTtlSeconds = accessTtlSeconds;
    }

    public String createAccessToken(User user) {
        try {
            Instant now = Instant.now();
            Instant exp = now.plusSeconds(accessTtlSeconds);

            var rsaKey = keyProvider.rsaJwk();
            var header = new JWSHeader.Builder(JWSAlgorithm.RS256)
                    .keyID(keyProvider.kid())
                    .type(JOSEObjectType.JWT)
                    .build();

            var claims = new JWTClaimsSet.Builder()
                    .subject(user.getId())
                    .issuer(issuer)
                    .audience(audience)
                    .issueTime(Date.from(now))
                    .expirationTime(Date.from(exp))
                    .claim("email", user.getEmail())
                    .claim("roles", user.getRoles())
                    .claim("status", user.getStatus())
                    .build();

            var jwt = new SignedJWT(header, claims);
            jwt.sign(new RSASSASigner(rsaKey.toPrivateKey()));
            return jwt.serialize();
        } catch (Exception e) {
            throw new RuntimeException("Failed to create access token", e);
        }
    }

    public long getAccessTtlSeconds() { return accessTtlSeconds; }
}
