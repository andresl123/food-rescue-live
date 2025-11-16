package com.foodrescue.uibff.receiver.service;

import com.foodrescue.uibff.web.response.ApiResponse;
import com.foodrescue.uibff.web.response.PODResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class BffPodService {

    private final WebClient webClient;

    // This gets 'http://localhost:8083' from your properties
    @Value("${services.evidence.base-url}")
    private String evidenceServiceUrl;

    public BffPodService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    /**
     * Fetches the latest POD from the evidence-service microservice.
     */
    public Mono<ApiResponse<PODResponse>> getLatestForJob(String jobId, Mono<Authentication> authMono) {
        // Calls: http://localhost:8083/api/v1/pods/latest/{jobId}
        String url = evidenceServiceUrl + "/api/v1/pods/latest/" + jobId;
        log.info("BFF proxying request to: {}", url);

        return authMono.flatMap(auth -> {
                    Jwt jwt = (Jwt) auth.getPrincipal();
                    return Mono.just(jwt.getTokenValue());
                })
                .flatMap(token ->
                        webClient.get()
                                .uri(url)
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                .retrieve()
                                .bodyToMono(new ParameterizedTypeReference<ApiResponse<PODResponse>>() {})
                                .onErrorResume(e -> {
                                    log.error("Failed to fetch POD from evidence-service", e);
                                    return Mono.error(new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching POD"));
                                })
                );
    }
}