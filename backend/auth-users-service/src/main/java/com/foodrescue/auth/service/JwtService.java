package com.foodrescue.auth.service;

import com.foodrescue.auth.crypto.KeyProvider;
import com.foodrescue.auth.entity.User;
import com.nimbusds.jose.JOSEObjectType;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Getter
@Setter
@Service
public class JwtService {

    private final KeyProvider keyProvider;
    private final String issuer;
    private final String audience;
    private final long accessTtlSeconds;
    private final long refreshTtlSeconds;

    // In-memory refresh registry: rti (refresh token jti) -> expiry epoch seconds
    private final Map<String, Long> refreshValid = new ConcurrentHashMap<>();

    public JwtService(
            KeyProvider keyProvider,
            @Value("${jwt.issuer}") String issuer,
            @Value("${jwt.audience}") String audience,
            @Value("${jwt.access-ttl-seconds:900}") long accessTtlSeconds,
            @Value("${jwt.refresh-ttl-seconds:1209600}") long refreshTtlSeconds // 14 days
    ) {
        this.keyProvider = keyProvider;
        this.issuer = issuer;
        this.audience = audience;
        this.accessTtlSeconds = accessTtlSeconds;
        this.refreshTtlSeconds = refreshTtlSeconds;
    }

    /** Create a short-lived access token (used on every API call). */
    public String createAccessToken(User user) {
        try {
            Instant now = Instant.now();
            Instant expiry = now.plusSeconds(accessTtlSeconds);
            String jti = UUID.randomUUID().toString();

            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .issuer(issuer)
                    .audience(audience)
                    .subject(user.getId())
                    .issueTime(Date.from(now))
                    .expirationTime(Date.from(expiry))
                    .jwtID(jti)
                    .claim("typ", "access")
                    .claim("email", user.getEmail())
                    .claim("roles", List.of(user.getCategoryId()))
                    .claim("status", user.getStatus())
                    .build();

            return sign(claims);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create access token", e);
        }
    }

    /** Create a long-lived refresh token (used only to obtain new access tokens). */
    public String createRefreshToken(User user) {
        try {
            Instant now = Instant.now();
            Instant expiry = now.plusSeconds(refreshTtlSeconds);
            String rti = UUID.randomUUID().toString(); // refresh token id (stored in jti)

            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .issuer(issuer)
                    .audience(audience)
                    .subject(user.getId())
                    .issueTime(Date.from(now))
                    .expirationTime(Date.from(expiry))
                    .jwtID(rti)
                    .claim("typ", "refresh")
                    .claim("email", user.getEmail())
                    .build();

            return sign(claims);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create refresh token", e);
        }
    }

    /** Register a freshly-issued refresh token in the in-memory registry. */
    public void registerRefresh(String serializedRefreshToken) {
        try {
            var jwt = SignedJWT.parse(serializedRefreshToken);
            var claims = jwt.getJWTClaimsSet();
            if (!"refresh".equals(claims.getStringClaim("typ"))) return;
            String rti = claims.getJWTID();
            long expEpoch = claims.getExpirationTime().toInstant().getEpochSecond();
            if (rti != null) refreshValid.put(rti, expEpoch);
        } catch (ParseException ignored) { }
    }

    /** Validate a refresh token’s rti against the registry (removes if expired). */
    public boolean isRefreshValid(String rti) {
        Long exp = refreshValid.get(rti);
        if (exp == null) return false;
        long now = Instant.now().getEpochSecond();
        if (now > exp) { refreshValid.remove(rti); return false; }
        return true;
    }

    /** Revoke a refresh token by its rti (used during rotation or logout). */
    public void revokeRefresh(String rti) {
        if (rti != null) refreshValid.remove(rti);
    }

    /** Rotate: revoke old rti, mint + register new refresh, and return it. */
    public String rotateRefresh(User user, String oldRti) {
        revokeRefresh(oldRti);
        String newRefresh = createRefreshToken(user);
        registerRefresh(newRefresh);
        return newRefresh;
    }

    // Cleanup expired refresh entries every 60 seconds
    @Scheduled(fixedDelay = 60_000)
    public void cleanupRefresh() {
        long now = Instant.now().getEpochSecond();
        refreshValid.entrySet().removeIf(e -> e.getValue() <= now);
    }

    // ---- helpers ----
    private String sign(JWTClaimsSet claims) throws Exception {
        var rsaKey = keyProvider.rsaJwk();
        var header = new JWSHeader.Builder(JWSAlgorithm.RS256)
                .type(JOSEObjectType.JWT)
                .keyID(rsaKey.getKeyID())
                .build();
        var jwt = new SignedJWT(header, claims);
        jwt.sign(new RSASSASigner(rsaKey.toPrivateKey()));
        return jwt.serialize();
    }
}
