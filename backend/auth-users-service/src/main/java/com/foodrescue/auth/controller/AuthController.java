package com.foodrescue.auth.controller;

import com.foodrescue.auth.service.PasswordResetService;
import com.foodrescue.auth.web.request.ForgotPasswordRequest;
import com.foodrescue.auth.web.request.ResetPasswordRequest;
import com.foodrescue.auth.web.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final PasswordResetService passwordResetService;

    public AuthController(PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        passwordResetService.requestReset(req);
        return ResponseEntity.ok(new ApiResponse<>("If the email exists, a reset link was sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        passwordResetService.resetPassword(req);
        return ResponseEntity.ok(new ApiResponse<>("Password updated successfully."));
    }
}
