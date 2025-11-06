package com.foodrescue.uibff.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.ConnectException;
import java.net.UnknownHostException;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class BffExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(BffExceptionHandler.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    /* ========= 1) Pass through upstream (microservice) responses ========= */
    @ExceptionHandler(WebClientResponseException.class)
    public Mono<ResponseEntity<byte[]>> handleWebClientResponse(WebClientResponseException ex) {
        // Keep upstream's status, headers (content-type), and body
        HttpHeaders pass = new HttpHeaders();
        String ct = ex.getHeaders().getFirst(HttpHeaders.CONTENT_TYPE);
        if (ct != null) pass.set(HttpHeaders.CONTENT_TYPE, ct);
        // (optional) copy any correlation headers your upstream returns
        return Mono.just(new ResponseEntity<>(ex.getResponseBodyAsByteArray(), pass, ex.getStatusCode()));
    }

    /* ========= 2) Local auth/authorization errors in the BFF ========= */
    @ExceptionHandler(AuthenticationException.class)
    public Mono<ResponseEntity<byte[]>> handleAuth(AuthenticationException ex, ServerWebExchange exch) {
        return json(HttpStatus.UNAUTHORIZED, "Unauthorized", exch);
    }

    @ExceptionHandler({AuthorizationDeniedException.class, AccessDeniedException.class})
    public Mono<ResponseEntity<byte[]>> handleAccessDenied(RuntimeException ex, ServerWebExchange exch) {
        return json(HttpStatus.FORBIDDEN, "Access denied", exch);
    }

    /* ========= 3) Upstream not reachable / DNS / connection issues ========= */
    @ExceptionHandler({ConnectException.class, UnknownHostException.class})
    public Mono<ResponseEntity<byte[]>> handleUpstreamConnectivity(Exception ex, ServerWebExchange exch) {
        log.warn("Upstream connectivity issue: {}", ex.toString());
        return json(HttpStatus.BAD_GATEWAY, "Upstream service unavailable", exch);
    }

    /* ========= 4) Propagate explicit status exceptions ========= */
    @ExceptionHandler(ResponseStatusException.class)
    public Mono<ResponseEntity<byte[]>> handleRse(ResponseStatusException ex, ServerWebExchange exch) {
        String msg = ex.getReason() != null ? ex.getReason() : ex.getMessage();
        return json(ex.getStatusCode(), msg, exch);
    }

    /* ========= 5) Misc client errors ========= */
    @ExceptionHandler(IllegalArgumentException.class)
    public Mono<ResponseEntity<byte[]>> handleBadRequest(IllegalArgumentException ex, ServerWebExchange exch) {
        return json(HttpStatus.BAD_REQUEST, ex.getMessage(), exch);
    }

    /* ========= 6) Fallback ========= */
    @ExceptionHandler(Exception.class)
    public Mono<ResponseEntity<byte[]>> handleGeneric(Exception ex, ServerWebExchange exch) {
        log.error("Unhandled error in BFF", ex);
        return json(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", exch);
    }

    /* ========= Helper: small JSON error body ========= */
    private Mono<ResponseEntity<byte[]>> json(HttpStatusCode status, String message, ServerWebExchange exch) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("timestamp", OffsetDateTime.now().toString());
            body.put("path", exch.getRequest().getPath().value());
            body.put("status", status.value());
            body.put("error", message);
            // optional: attach requestId if you set one in Reactor Context / filters
            body.put("requestId", exch.getRequest().getId());
            byte[] bytes = MAPPER.writeValueAsBytes(body);

            HttpHeaders h = new HttpHeaders();
            h.setContentType(MediaType.APPLICATION_JSON);
            return Mono.just(new ResponseEntity<>(bytes, h, status));
        } catch (Exception e) {
            // Extremely unlikely; fall back to empty body
            return Mono.just(ResponseEntity.status(status).build());
        }
    }
}
