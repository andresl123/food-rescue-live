package com.foodrescue.auth.web.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserUpdateRequest(

        @NotBlank(message = "Name cannot be blank.")
        @Size(max = 120)
        String name,

        @NotBlank(message = "Email cannot be blank.")
        @Email(message = "Must be a valid email format.")
        String email,

        @NotBlank(message = "Role cannot be blank.")
        String role,

        @NotBlank(message = "Status cannot be blank.")
        @Size(max = 50)
        String status
) {
}