package com.foodrescue.uibff.http;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import org.springframework.web.reactive.function.client.ClientRequest;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Configuration
public class WebClientConfig {

    /**
     * Relay inbound Authorization header from current ServerWebExchange
     * (stored in Reactor Context by ProxySupport) to downstream calls.
     */
    private ExchangeFilterFunction authRelayFilter() {
        return (request, next) -> Mono.deferContextual(ctx -> {
            ClientRequest.Builder b = ClientRequest.from(request);
            ServerWebExchange ex = ctx.getOrDefault(ServerWebExchange.class, null);
            if (ex != null) {
                String auth = ex.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
                if (auth != null && !auth.isBlank()) {
                    b.header(HttpHeaders.AUTHORIZATION, auth);
                }
            }
            return next.exchange(b.build());
        });
    }

    @Bean
    @Primary
    public WebClient webClient(WebClient.Builder builder) {
        return builder
                .filter(authRelayFilter())
                .build();
    }

    /** Downstream client pointing to the Auth service. */
    @Bean("authClient")
    public WebClient authClient(
            WebClient.Builder builder,
            @Value("${services.auth.base-url}") String baseUrl) {

        return builder
                .baseUrl(baseUrl) // e.g. http://localhost:8080
                .filter(authRelayFilter())
                .build();
    }
}
