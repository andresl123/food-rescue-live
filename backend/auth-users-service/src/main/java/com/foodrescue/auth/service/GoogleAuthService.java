package com.foodrescue.auth.service;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class GoogleAuthService {
    private final WebClient webClient;

    public GoogleAuthService() {
        this.webClient = WebClient.create();
    }

    public Mono<Map<String,String>> verify(String idToken) {
        return webClient.get()
                .uri("https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String,String>>() {})
                // Convert any error from Google into an IllegalArgumentException
                .onErrorMap(ex -> new IllegalArgumentException("Invalid Google token", ex));
    }
}
