package com.foodrescue.uibff.receiver.service;

import com.foodrescue.uibff.web.response.RecentOrderDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import com.foodrescue.uibff.web.response.AdminOrderView;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class BffJobService {

    private final WebClient webClient;

    // This value will be 'http://localhost:8082' or 'http://jobs-service:8082'
    @Value("${services.jobs.base-url}")
    private String jobsServiceUrl;

    public BffJobService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    /**
     * Fetches recent orders from the jobs-service microservice.
     */
    public Flux<RecentOrderDto> getRecentOrders(Mono<Authentication> authMono) { // <-- 5. ACCEPT authMono
        String url = jobsServiceUrl + "/api/v1/jobs/admin/recent-orders";
        log.info("BFF proxying request to: {}", url);

        // 6. Get the token from the authentication object
        return authMono.flatMap(auth -> {
                    // This assumes you are using standard Spring Security with JWTs
                    if (auth.getPrincipal() instanceof Jwt) {
                        Jwt jwt = (Jwt) auth.getPrincipal();
                        return Mono.just(jwt.getTokenValue());
                    }
                    return Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Cannot extract JWT from Authentication"));
                })
                .flatMapMany(token ->
                        // 7. Use the token in the outgoing request
                        webClient.get()
                                .uri(url)
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token) // <-- 8. ADD THE HEADER
                                .retrieve()
                                .bodyToFlux(RecentOrderDto.class)
                                .onErrorResume(e -> {
                                    log.error("Failed to fetch recent orders from jobs-service", e);
                                    return Flux.error(new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching recent orders"));
                                })
                );
    }
    public Mono<Long> getOrdersTodayCount(Mono<Authentication> authMono) {
        // This is the correct path for your jobs-service
        String url = jobsServiceUrl + "/api/v1/jobs/admin/orders-today-count";
        log.info("BFF proxying request to: {}", url);

        return authMono.flatMap(auth -> {
                    // Get the JWT token
                    Jwt jwt = (Jwt) auth.getPrincipal();
                    return Mono.just(jwt.getTokenValue());
                })
                .flatMap(token ->
                        // Call the endpoint
                        webClient.get()
                                .uri(url)
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                .retrieve()
                                .bodyToMono(Long.class) // Expecting a simple number back
                                .onErrorResume(e -> {
                                    log.error("Failed to fetch orders-today-count from jobs-service", e);
                                    return Mono.just(0L); // Return 0 on error
                                })
                );
    }
    public Flux<AdminOrderView> getAdminOrderView(Mono<Authentication> authMono) {
        String url = jobsServiceUrl + "/api/v1/jobs/admin/order-view";
        log.info("BFF proxying request to: {}", url);

        return authMono.flatMap(auth -> {
                    Jwt jwt = (Jwt) auth.getPrincipal();
                    return Mono.just(jwt.getTokenValue());
                })
                .flatMapMany(token ->
                        webClient.get()
                                .uri(url)
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                .retrieve()
                                .bodyToFlux(AdminOrderView.class)
                                .onErrorResume(e -> {
                                    log.error("Failed to fetch admin order view from jobs-service", e);
                                    return Flux.error(new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching order view"));
                                })
                );
    }
}