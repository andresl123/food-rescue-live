package com.foodrescue.auth.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {

    @NotBlank(message = "New password must not be blank.")
    @Size(min = 8, message = "Password must be at least 8 characters long.")
    private String newPassword;
}