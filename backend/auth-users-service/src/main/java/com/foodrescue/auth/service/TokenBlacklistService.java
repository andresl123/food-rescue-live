package com.foodrescue.auth.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

/** In-memory blacklist: jti -> expEpochSeconds */
@Service
public class TokenBlacklistService {

    private final ConcurrentHashMap<String, Long> revoked = new ConcurrentHashMap<>();

    /** Mark a token id as revoked until its natural exp time. */
    public void revoke(String jti, long expEpochSeconds) {
        if (jti != null && expEpochSeconds > 0) {
            revoked.put(jti, expEpochSeconds);
        }
    }

    /** True if JTI is in blacklist and not yet purged. Never throws. */
    public boolean isRevoked(String jti) {
        try {
            if (jti == null) return false;
            Long exp = revoked.get(jti);
            if (exp == null) return false;

            long now = Instant.now().getEpochSecond();

            // If already beyond exp, delete the entry (best-effort) and still treat as revoked
            if (now >= exp) {
                revoked.remove(jti);
                return true; // still reject this token; it is expired anyway
            }
            return true; // present in blacklist → revoked
        } catch (Throwable ignored) {
            // Defensive: never let callers blow up → default to NOT revoked
            return false;
        }
    }

    /** Optional: scheduled cleanup elsewhere; safe to remove here too. */
    public void purgeExpired() {
        long now = Instant.now().getEpochSecond();
        revoked.entrySet().removeIf(e -> e.getValue() <= now);
    }

    /** Dev/debug helper */
    public Long getExpiryEpoch(String jti) {
        return revoked.get(jti);
    }
}