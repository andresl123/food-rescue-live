package com.foodrescue.auth.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {

    // jti -> expirationEpochSeconds
    private final Map<String, Long> revoked = new ConcurrentHashMap<>();

    public void revoke(String jti, long expiresAtEpochSeconds) {
        if (jti != null) {
            revoked.put(jti, expiresAtEpochSeconds);
        }
    }

    /** Returns true if the jti is currently revoked (and not past exp). */
    public boolean isRevoked(String jti) {
        Long exp = revoked.get(jti);
        if (exp == null) return false;
        long now = Instant.now().getEpochSecond();
        if (now > exp) {
            revoked.remove(jti); // expired -> clean it up eagerly
            return false;
        }
        return true;
    }

    /** DEV ONLY: peek the stored expiry for a jti (may be null if not present). */
    public Long getExpiryEpoch(String jti) {
        return revoked.get(jti);
    }

    // Periodic cleanup
    @Scheduled(fixedDelay = 60_000)
    public void cleanup() {
        long now = Instant.now().getEpochSecond();
        revoked.entrySet().removeIf(e -> e.getValue() <= now);
    }
}