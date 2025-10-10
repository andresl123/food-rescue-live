package com.foodrescue.auth.service;

import com.foodrescue.auth.entity.PasswordResetToken;
import com.foodrescue.auth.entity.User;
import com.foodrescue.auth.repository.PasswordResetTokenRepository;
import com.foodrescue.auth.repository.UserRepository;
import com.foodrescue.auth.web.request.ForgotPasswordRequest;
import com.foodrescue.auth.web.request.ResetPasswordRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    private final String appUrl;
    private final long tokenMinutes;

    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            EmailService emailService,
            PasswordEncoder passwordEncoder,
            @Value("${app.url:http://localhost:8080}") String appUrl,
            @Value("${password.reset.token.minutes:15}") long tokenMinutes) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.appUrl = appUrl;
        this.tokenMinutes = tokenMinutes;
    }

    public void requestReset(ForgotPasswordRequest req) {
        User user = userRepository.findByEmail(req.getEmail()).orElse(null);

        // Always respond OK (avoid user enumeration)
        if (user != null) {
            tokenRepository.deleteByUserId(user.getId()); // invalidate older tokens

            String token = UUID.randomUUID().toString();
            PasswordResetToken prt = new PasswordResetToken();
            prt.setUserId(user.getId());
            prt.setToken(token);
            prt.setExpiresAt(Instant.now().plus(tokenMinutes, ChronoUnit.MINUTES));
            tokenRepository.save(prt);

            String link = appUrl + "/api/auth/reset-password?token=" + token;
            emailService.sendPasswordResetLink(user.getEmail(), link);
        }
    }

    public void resetPassword(ResetPasswordRequest req) {
        PasswordResetToken prt = tokenRepository.findByToken(req.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid token"));

        if (prt.isUsed() || prt.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Token expired or already used");
        }

        User user = userRepository.findById(prt.getUserId())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        prt.setUsed(true);
        tokenRepository.save(prt);
        tokenRepository.deleteByUserId(user.getId()); // defense-in-depth
    }
}
