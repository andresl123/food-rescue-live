package com.foodrescue.auth.controller;

import com.foodrescue.auth.entity.ResetPasswordRequest;
import com.foodrescue.auth.service.VerificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/password")
public class PasswordController {

    private final VerificationService verificationService;

    @Autowired
    public PasswordController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @PostMapping("/reset/{email}/{code}")
    public Mono<ResponseEntity<Map<String, String>>> resetPassword(
            @PathVariable String email,
            @PathVariable String code,
            @Valid @RequestBody ResetPasswordRequest request) {

        return verificationService.resetPassword(email, code, request.getNewPassword())
                .then(Mono.just(
                        ResponseEntity.ok(Map.of("message", "Password has been reset successfully."))
                ))
                .onErrorResume(RuntimeException.class, ex ->
                        Mono.just(ResponseEntity.badRequest().body(Map.of("message", ex.getMessage())))
                );
    }
}