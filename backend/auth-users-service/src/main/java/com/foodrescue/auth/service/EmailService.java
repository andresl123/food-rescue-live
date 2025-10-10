package com.foodrescue.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    public void sendPasswordResetLink(String toEmail, String resetLink) {
        // TODO: replace with real SMTP (JavaMailSender/SES/SendGrid)
        log.info("Password reset email TO={} LINK={}", toEmail, resetLink);
    }
}
