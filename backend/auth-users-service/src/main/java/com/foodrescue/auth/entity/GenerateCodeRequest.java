package com.foodrescue.auth.entity;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GenerateCodeRequest {

    @NotBlank(message = "Identifier must not be blank.")
    @Email(message = "Identifier must be a valid email address.")
    private String identifier;

    private String purpose; // e.g. "FORGOT_PASSWORD" or "UPDATE_EMAIL"
}