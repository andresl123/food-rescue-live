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
    private final UserRepository userRepository; //  

    private record CodeDetails(String code, Instant expiryTime) {}

    public VerificationService(@Value("${courier.api.key}") String apiKey,
                               UserRepository userRepository) { //  
        this.courierClient = Courier.builder() 
                .authorizationToken(apiKey)
                .build();
        this.userRepository = userRepository;
    }

    public Mono<Void> generateAndSendCode(String email) {
        return userRepository.existsByEmail(email) //
                .flatMap(userExists -> {
                    if (!userExists) {
                        return Mono.error(new UserNotFoundException("User with email " + email + " not found."));
                    }

                    SecureRandom random = new SecureRandom();
                    int codeValue = 100000 + random.nextInt(900000);
                    String code = String.valueOf(codeValue);

                    Instant expiryTime = Instant.now().plus(EXPIRATION_MINUTES, ChronoUnit.MINUTES);
                    codeStore.put(email, new CodeDetails(code, expiryTime));

                    return Mono.fromRunnable(() -> {
                        try {
                            sendEmailWithCourier(email, code);
                        } catch (IOException e) {
                            System.err.println("Error sending verification code via Courier: " + e.getMessage());
                            throw new RuntimeException("Failed to send email", e);
                        }
                    }).subscribeOn(Schedulers.boundedElastic()).then();
                });
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

    public boolean validateCode(String identifier, String code) {
        CodeDetails storedDetails = codeStore.get(identifier);

        if (storedDetails == null) {
            return false;
        }
        if (Instant.now().isAfter(storedDetails.expiryTime())) {
            codeStore.remove(identifier);
            return false;
        }
        if (storedDetails.code().equals(code)) {
            codeStore.remove(identifier);
            return true;
        }
        return false;
    }
}