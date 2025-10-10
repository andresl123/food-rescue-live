package com.foodrescue.auth.web.response;

public record TokenResponse(String accessToken, long expiresIn) {}