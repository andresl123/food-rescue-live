package com.foodrescue.auth.entity;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document("password_reset_tokens")
public class PasswordResetToken {

    @Id
    private String id;

    private String userId;

    @Indexed(unique = true)
    private String token;

    // TTL: when expiresAt < now, MongoDB auto-deletes (expireAfterSeconds=0)
    @Indexed(expireAfterSeconds = 0)
    private Instant expiresAt;

    private boolean used = false;

    @CreatedDate
    private Instant createdAt;

    // getters & setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public boolean isUsed() { return used; }
    public void setUsed(boolean used) { this.used = used; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
