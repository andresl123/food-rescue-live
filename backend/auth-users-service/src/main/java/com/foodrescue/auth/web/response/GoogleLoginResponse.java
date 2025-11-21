package com.foodrescue.auth.web.response;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record GoogleLoginResponse(
        boolean newUser,
        String userId,
        String email,
        String name,
        TokenResponse tokens
) {}
