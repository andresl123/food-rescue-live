package com.foodrescue.feedback_service.controller;

import com.foodrescue.feedback_service.dto.CourierFeedbackRequest;
import com.foodrescue.feedback_service.dto.OrderFeedbackRequest;
import com.foodrescue.feedback_service.model.CourierFeedbackDocument;
import com.foodrescue.feedback_service.model.OrderFeedbackDocument;
import com.foodrescue.feedback_service.service.FeedbackService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@RestController
@RequestMapping("/api/v1/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /* ------------ CREATE / UPDATE ------------ */

    @PostMapping(path = "/order", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<OrderFeedbackDocument>> createOrUpdateOrderFeedback(
            @Valid @RequestBody OrderFeedbackRequest request,
            ServerWebExchange exchange
    ) {
        String receiverId = extractReceiverIdFromJwt(exchange);
        return feedbackService.createOrUpdateOrderFeedback(request, receiverId)
                .map(ResponseEntity::ok);
    }

    @PostMapping(path = "/courier", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<CourierFeedbackDocument>> createOrUpdateCourierFeedback(
            @Valid @RequestBody CourierFeedbackRequest request,
            ServerWebExchange exchange
    ) {
        String receiverId = extractReceiverIdFromJwt(exchange);
        return feedbackService.createOrUpdateCourierFeedback(request, receiverId)
                .map(ResponseEntity::ok);
    }

    /* ------------ NEW: READ for prefill ------------ */

    @GetMapping(path = "/order")
    public Mono<ResponseEntity<Object>> getOrderFeedback(
            @RequestParam("orderId") String orderId,
            ServerWebExchange exchange
    ) {
        String receiverId = extractReceiverIdFromJwt(exchange);

        return feedbackService
                .getOrderFeedback(orderId, receiverId)   // Mono<OrderFeedbackDocument>
                .<ResponseEntity<Object>>map(ResponseEntity::ok)
                .switchIfEmpty(
                        Mono.just(
                                ResponseEntity.ok(
                                        java.util.Map.of("message", "Not found")
                                )
                        )
                );
    }

    @GetMapping(path = "/courier")
    public Mono<ResponseEntity<CourierFeedbackDocument>> getCourierFeedback(
            @RequestParam("orderId") String orderId,
            @RequestParam("courierId") String courierId,
            ServerWebExchange exchange
    ) {
        String receiverId = extractReceiverIdFromJwt(exchange);
        return feedbackService.getCourierFeedback(orderId, courierId, receiverId)
                .map(ResponseEntity::ok)
                .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()));
    }

    /**
     * Extracts user id (receiverId) from Authorization: Bearer <jwt>
     * Assumes user id is in "sub" claim.
     */
    private String extractReceiverIdFromJwt(ServerWebExchange exchange) {
        String auth = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (!StringUtils.hasText(auth) || !auth.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing Authorization header");
        }

        String token = auth.substring(7); // after 'Bearer '
        String[] parts = token.split("\\.");
        if (parts.length < 2) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid JWT format");
        }

        String payloadPart = parts[1];
        try {
            byte[] decoded = Base64.getUrlDecoder().decode(payloadPart);
            String json = new String(decoded, StandardCharsets.UTF_8);
            JsonNode node = objectMapper.readTree(json);
            JsonNode subNode = node.get("sub");
            if (subNode == null || !subNode.isTextual()) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "sub not found in token");
            }
            return subNode.asText();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Cannot decode JWT payload");
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Cannot parse JWT payload");
        }
    }
}
