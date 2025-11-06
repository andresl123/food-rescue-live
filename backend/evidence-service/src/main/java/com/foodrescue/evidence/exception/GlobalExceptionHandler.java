package com.foodrescue.evidence.exception;

import com.foodrescue.evidence.web.response.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException; // <-- important
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.support.WebExchangeBindException;
import reactor.core.publisher.Mono;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /* ===== 401 Unauthorized ===== */
    @ExceptionHandler(AuthenticationException.class)
    public Mono<ResponseEntity<ApiResponse<Void>>> handleAuthentication(AuthenticationException ex) {
        log.debug("AuthenticationException: {}", ex.getMessage());
        return Mono.just(ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Unauthorized")));
    }

    /* ===== 403 Forbidden (new: AuthorizationDeniedException) ===== */
    @ExceptionHandler({ AuthorizationDeniedException.class, AccessDeniedException.class })
    public Mono<ResponseEntity<ApiResponse<Void>>> handleAccessDenied(RuntimeException ex) {
        log.debug("{}: {}", ex.getClass().getSimpleName(), ex.getMessage());
        return Mono.just(ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Access denied")));
    }

    /* ===== 400 Bad Request ===== */
    @ExceptionHandler(IllegalArgumentException.class)
    public Mono<ResponseEntity<ApiResponse<Void>>> handleIllegalArgument(IllegalArgumentException ex) {
        return Mono.just(ResponseEntity.badRequest()
                .body(ApiResponse.error(ex.getMessage())));
    }

    /* ===== 400 Validation ===== */
    @ExceptionHandler(WebExchangeBindException.class)
    public Mono<ResponseEntity<ApiResponse<Void>>> handleValidation(WebExchangeBindException ex) {
        String msg = ex.getFieldErrors().stream()
                .map(f -> f.getField() + " " + (f.getDefaultMessage() == null ? "is invalid" : f.getDefaultMessage()))
                .reduce((a, b) -> a + "; " + b)
                .orElse("Validation failed");
        return Mono.just(ResponseEntity.badRequest()
                .body(ApiResponse.error(msg)));
    }

    /* ===== Propagate ResponseStatusException ===== */
    @ExceptionHandler(ResponseStatusException.class)
    public Mono<ResponseEntity<ApiResponse<Void>>> handleRse(ResponseStatusException ex) {
        return Mono.just(ResponseEntity
                .status(ex.getStatusCode())
                .body(ApiResponse.error(ex.getReason() == null ? ex.getMessage() : ex.getReason())));
    }

    /* ===== 500 Fallback (log class for debugging) ===== */
    @ExceptionHandler(Exception.class)
    public Mono<ResponseEntity<ApiResponse<Void>>> handleGeneric(Exception ex) {
        log.error("Unhandled exception type: {}", ex.getClass().getName(), ex);
        return Mono.just(ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An unexpected error occurred")));
    }
}
