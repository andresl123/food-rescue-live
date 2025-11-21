package com.foodrescue.auth.web.request;

import jakarta.validation.constraints.NotBlank;

public record CompleteGoogleSignupRequest(
        @NotBlank String userId,
        @NotBlank String password,
        @NotBlank String categoryId,
        @NotBlank String phoneNumber,
        @NotBlank String street,
        @NotBlank String city,
        @NotBlank String state,
        @NotBlank String postalCode,
        @NotBlank String country
) {}
