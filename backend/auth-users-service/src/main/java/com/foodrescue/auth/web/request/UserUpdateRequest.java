package com.foodrescue.auth.web.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.Set;

public record UserUpdateRequest(

        @NotBlank(message = "Name cannot be blank.")
        @Size(max = 120)
        String name,

        @NotBlank(message = "Email cannot be blank.")
        @Email(message = "Must be a valid email format.")
        String email,

        @NotEmpty(message = "Roles cannot be empty.")
        Set<String> roles,

        @NotBlank(message = "Status cannot be blank.")
        @Size(max = 50)
        String status
) {
}