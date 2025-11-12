package com.foodrescue.auth.service;

import com.courier.api.Courier; 
import com.courier.api.requests.SendMessageRequest; 
import com.courier.api.resources.send.types.Content; 
import com.courier.api.resources.send.types.ContentMessage; 
import com.courier.api.resources.send.types.ElementalContentSugar; 
import com.courier.api.resources.send.types.Message; 
import com.courier.api.resources.send.types.MessageRecipient; 
import com.courier.api.resources.send.types.Recipient; 
import com.courier.api.resources.send.types.UserRecipient; 
import com.foodrescue.auth.exception.UserNotFoundException;
import com.foodrescue.auth.repository.UserRepository; 
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono; 
import reactor.core.scheduler.Schedulers;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.IOException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class VerificationService {

    private final Map<String, CodeDetails> codeStore = new ConcurrentHashMap<>();
    private static final long EXPIRATION_MINUTES = 5;
    private final Courier courierClient;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private record CodeDetails(String code, Instant expiryTime) {}

    public VerificationService(@Value("${courier.api.key}") String apiKey,
                               UserRepository userRepository,
                               PasswordEncoder passwordEncoder) {
        this.courierClient = Courier.builder()
                .authorizationToken(apiKey)
                .build();
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Mono<Void> generateAndSendCode(String email, String purpose) {
        System.out.println("Generating code for: " + email + " | Purpose: " + purpose);

        if ("FORGOT_PASSWORD".equalsIgnoreCase(purpose)) {
            // Only check DB for forgot password flow
            return userRepository.existsByEmail(email)
                    .flatMap(userExists -> {
                        if (!userExists) {
                            return Mono.error(new UserNotFoundException("User with email " + email + " not found."));
                        }
                        return sendOtp(email);
                    });
        } else {
            // For UPDATE_EMAIL_PHONE or any other flow — skip DB check
            return sendOtp(email);
        }
    }

    private Mono<Void> sendOtp(String email) {
        SecureRandom random = new SecureRandom();
        int codeValue = 100000 + random.nextInt(900000);
        String code = String.valueOf(codeValue);

        Instant expiryTime = Instant.now().plus(EXPIRATION_MINUTES, ChronoUnit.MINUTES);
        codeStore.put(email, new CodeDetails(code, expiryTime));

        return Mono.fromRunnable(() -> {
            try {
                sendEmailWithCourier(email, code);
            } catch (IOException e) {
                e.printStackTrace();
                throw new RuntimeException("Failed to send email", e);
            }
        }).subscribeOn(Schedulers.boundedElastic()).then();
    }



//    public Mono<Void> generateAndSendCode(String email) {
//        return userRepository.existsByEmail(email)
//                .flatMap(userExists -> {
//                    if (!userExists) {
//                        return Mono.error(new UserNotFoundException("User with email " + email + " not found."));
//                    }
//
//                    SecureRandom random = new SecureRandom();
//                    int codeValue = 100000 + random.nextInt(900000);
//                    String code = String.valueOf(codeValue);
//
//                    Instant expiryTime = Instant.now().plus(EXPIRATION_MINUTES, ChronoUnit.MINUTES);
//                    codeStore.put(email, new CodeDetails(code, expiryTime));
//
//                    return Mono.fromRunnable(() -> {
//                        try {
//                            sendEmailWithCourier(email, code);
//                        } catch (IOException e) {
//                            System.err.println("Error sending verification code via Courier: " + e.getMessage());
//                            throw new RuntimeException("Failed to send email", e);
//                        }
//                    }).subscribeOn(Schedulers.boundedElastic()).then();
//                });
//    }

    public boolean validateCode(String identifier, String code) {
        CodeDetails storedDetails = codeStore.get(identifier);
        if (storedDetails == null || !storedDetails.code().equals(code) || Instant.now().isAfter(storedDetails.expiryTime())) {
            return false;
        }
        codeStore.remove(identifier);

        //navpreet update
        verifiedMap.put(identifier, true);
        //navpreet update

        return true;
    }

    public Mono<Void> resetPassword(String email, String code, String newPassword) {
        // First, validate the code from our in-memory store
        boolean isCodeValid = this.validateCode(email, code);

        if (!isCodeValid) {
            return Mono.error(new RuntimeException("Invalid or expired verification code."));
        }

        return userRepository.findByEmail(email)
                .switchIfEmpty(Mono.error(new UserNotFoundException("User not found.")))
                .flatMap(user -> {
                user.setPassword(passwordEncoder.encode(newPassword));
                    return userRepository.save(user);
                })
                .then();
    }

    private void sendEmailWithCourier(String email, String code) throws IOException {
        this.courierClient.send(SendMessageRequest.builder()
                .message(Message.of(ContentMessage.builder()
                        .content(Content.of(ElementalContentSugar.builder()
                        .title("Your Verification Code")
                        .body("Your 6-digit verification code is: {{code}}")
                        .build()))
                        .to(MessageRecipient.of(Recipient.of(UserRecipient.builder()
                                .email(email)
                                .build())))
                        .data(Map.of("code", code))
                        .build()))
                .build());
        System.out.println("Verification code sent successfully to " + email);
    }

    // ✅ Track which identifiers have been verified successfully
    private final Map<String, Boolean> verifiedMap = new ConcurrentHashMap<>();

    public boolean isVerified(String identifier) {
        return verifiedMap.getOrDefault(identifier, false);
    }

}