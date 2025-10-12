// src/main/java/com/example/codeverification/controller/VerificationController.java
package com.foodrescue.auth.controller;

import com.foodrescue.auth.entity.GenerateCodeRequest;
import com.foodrescue.auth.entity.ValidateCodeRequest;
import com.foodrescue.auth.service.VerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/code")
public class VerificationController {

    private final VerificationService verificationService;

    @Autowired
    public VerificationController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateCode(@RequestBody GenerateCodeRequest request) {
        if (request.getIdentifier() == null || request.getIdentifier().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Identifier cannot be empty."));
        }

        String code = verificationService.generateCode(request.getIdentifier());

        // IMPORTANT: In a real-world scenario, you would NOT return the code here.
        // This response is for demonstration purposes only.
        // A real response would be something like:
        // return ResponseEntity.ok(Map.of("message", "A verification code has been sent to " + request.getIdentifier()));
        return ResponseEntity.ok(Map.of(
                "message", "Code generated successfully (for demo only).",
                "code", code
        ));
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validateCode(@RequestBody ValidateCodeRequest request) {
        boolean isValid = verificationService.validateCode(request.getIdentifier(), request.getCode());

        if (isValid) {
            return ResponseEntity.ok(Map.of("message", "Code is valid."));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired code."));
        }
    }
}