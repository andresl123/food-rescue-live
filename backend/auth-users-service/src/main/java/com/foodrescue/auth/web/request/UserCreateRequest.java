package com.foodrescue.auth.web.request;

import jakarta.validation.constraints.*;
import java.util.Set;

public record UserCreateRequest(
        @NotBlank @Size(max=120) String name,
        @NotBlank @Email String email,
        @NotBlank @Size(min=8, max=128) String password,
        @NotBlank String categoryId,
        String phoneNumber,
        String defaultAddressId,
        Set<String> roles
) {}
