package com.foodrescue.auth.controller;

import com.foodrescue.auth.entity.GenerateCodeRequest;
import com.foodrescue.auth.entity.ValidateCodeRequest;
import com.foodrescue.auth.exception.UserNotFoundException;
import com.foodrescue.auth.service.VerificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/code")
public class VerificationController {

    private final VerificationService verificationService;

    @Autowired
    public VerificationController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

//    @PostMapping("/generate")
//    public Mono<ResponseEntity<?>> generateCode(@Valid @RequestBody GenerateCodeRequest request) {
//        return verificationService.generateAndSendCode(request.getIdentifier(), request.getPurpose())
//                .then(Mono.just(
//                        ResponseEntity.ok(Map.of("message", "A verification code has been sent to your email."))
//                ));
//    }

    @PostMapping("/generate")
    public Mono<ResponseEntity<Map<String, Object>>> generateCode(@Valid @RequestBody GenerateCodeRequest request) {
        return verificationService.generateAndSendCode(request.getIdentifier(), request.getPurpose())
                .then(Mono.fromCallable(() -> {
                    Map<String, Object> successBody = new HashMap<>();
                    successBody.put("message", "A verification code has been sent to your email.");
                    return ResponseEntity.<Map<String, Object>>ok(successBody);
                }))
                .onErrorResume(UserNotFoundException.class, ex -> {
                    Map<String, Object> errorBody = new HashMap<>();
                    errorBody.put("success", false);
                    errorBody.put("message", ex.getMessage());
                    return Mono.just(ResponseEntity.<Map<String, Object>>status(HttpStatus.NOT_FOUND).body(errorBody));
                })
                .onErrorResume(Exception.class, ex -> {
                    Map<String, Object> errorBody = new HashMap<>();
                    errorBody.put("success", false);
                    errorBody.put("message", ex.getMessage());
                    return Mono.just(ResponseEntity.<Map<String, Object>>status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorBody));
                });
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