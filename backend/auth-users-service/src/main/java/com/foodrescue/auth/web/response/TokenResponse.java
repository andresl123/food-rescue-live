package com.foodrescue.auth.web.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenResponse {
    private String accessToken;
    private long   accessExpiresIn;   // seconds
    private String refreshToken;
    private long   refreshExpiresIn;  // seconds
}