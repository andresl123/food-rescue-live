// src/main/java/com/example/codeverification/service/VerificationService.java
package com.foodrescue.auth.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import java.time.temporal.ChronoUnit;

@Service
public class VerificationService {

    // A simple in-memory store for the codes.
    // Key: User identifier (e.g., email)
    // Value: The CodeDetails record
    private final Map<String, CodeDetails> codeStore = new ConcurrentHashMap<>();
    private static final long EXPIRATION_MINUTES = 5; // Code expires in 5 minutes

    // Using a record for immutable data storage
    private record CodeDetails(String code, Instant expiryTime) {}

    /**
     * Generates a 6-digit verification code for a given identifier.
     * In a real application, this method would also trigger sending the code
     * via email or SMS.
     * @param identifier The user identifier (e.g., email).
     * @return The generated 6-digit code.
     */
    public String generateCode(String identifier) {
        // Generate a random 6-digit number
        SecureRandom random = new SecureRandom();
        int codeValue = 100000 + random.nextInt(900000); // Generates a number between 100000 and 999999
        String code = String.valueOf(codeValue);

        // Calculate expiration time
        Instant expiryTime = Instant.now().plus(EXPIRATION_MINUTES, ChronoUnit.MINUTES);

        // Store the code and its expiration time
        codeStore.put(identifier, new CodeDetails(code, expiryTime));

        // For demonstration, we return the code.
        // In a real app, you would NEVER return the code in the API response.
        // You would send it via email/SMS.
        System.out.println("Generated code for " + identifier + ": " + code);
        return code;
    }

    /**
     * Validates the provided code for a given identifier.
     * @param identifier The user identifier.
     * @param code The 6-digit code to validate.
     * @return true if the code is valid, false otherwise.
     */
    public boolean validateCode(String identifier, String code) {
        CodeDetails storedDetails = codeStore.get(identifier);

        if (storedDetails == null) {
            // No code was generated for this identifier
            return false;
        }

        // Check if the code has expired
        if (Instant.now().isAfter(storedDetails.expiryTime())) {
            codeStore.remove(identifier); // Clean up expired code
            return false;
        }

        // Check if the code matches
        if (storedDetails.code().equals(code)) {
            // Code is correct, remove it to prevent reuse (one-time use)
            codeStore.remove(identifier);
            return true;
        }

        return false;
    }
}