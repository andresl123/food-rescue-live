package com.foodrescue.uibff.http;

import com.foodrescue.uibff.auth.RefreshService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.*;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Configuration
public class WebClientConfig {

    // === Helper: copy inbound Authorization to outgoing requests (first try) ===
    private ExchangeFilterFunction authRelayFilter() {
        return (request, next) -> Mono.deferContextual(ctx -> {
            ClientRequest.Builder b = ClientRequest.from(request);

            // If this is a retry with a refreshed token we already injected, don't overwrite it.
            boolean hasAuth = request.headers().containsKey(HttpHeaders.AUTHORIZATION);

            ServerWebExchange ex = ctx.getOrDefault(ServerWebExchange.class, null);
            if (!hasAuth && ex != null) {
                String auth = ex.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
                if (auth != null && !auth.isBlank()) {
                    b.header(HttpHeaders.AUTHORIZATION, auth);
                }
            }
            return next.exchange(b.build());
        });
    }

    // === The magic: when downstream replies 401, refresh and retry once ===
    private ExchangeFilterFunction refreshOn401Filter(RefreshService refreshService) {
        return ExchangeFilterFunction.ofResponseProcessor(response ->
                response.statusCode() == HttpStatus.UNAUTHORIZED
                        ? Mono.error(new WebClientResponseException(
                        "401 from downstream", 401, "Unauthorized",
                        response.headers().asHttpHeaders(), null, null))
                        : Mono.just(response)
        ).andThen((request, next) ->
                next.exchange(request).onErrorResume(WebClientResponseException.class, ex -> {
                    if (ex.getStatusCode() != HttpStatus.UNAUTHORIZED) {
                        return Mono.error(ex);
                    }
                    // We got 401: try to refresh
                    return Mono.deferContextual(ctx -> {
                        ServerWebExchange exchange = ctx.getOrDefault(ServerWebExchange.class, null);
                        if (exchange == null) {
                            return Mono.error(ex);
                        }
                        // Avoid infinite loop: if already retried, give up
                        if (Boolean.TRUE.equals(request.attribute("retried").orElse(false))) {
                            return Mono.error(ex);
                        }

                        String currentAccess = request.headers().getFirst(HttpHeaders.AUTHORIZATION);
                        return refreshService.refreshAccessToken(exchange, currentAccess)
                                .flatMap(newAccess -> {
                                    // Retry original request once with new Authorization
                                    ClientRequest retry = ClientRequest.from(request)
                                            .headers(h -> h.set(HttpHeaders.AUTHORIZATION, "Bearer " + newAccess))
                                            .attribute("retried", true)
                                            .build();
                                    return next.exchange(retry);
                                })
                                .switchIfEmpty(Mono.error(ex)); // refresh failed → bubble 401
                    });
                })
        );
    }

    /**
     * Base WebClient used for *downstream* microservices (NOT auth).
     * It relays inbound access token, and if a call comes back 401,
     * it refreshes via Auth and retries once with the new token.
     */
    @Bean
    @Primary
    public WebClient webClient(WebClient.Builder builder, RefreshService refreshService) {
        return builder
                .filter(authRelayFilter())
                .filter(refreshOn401Filter(refreshService))
                .build();
    }

    /**
     * Named client to talk to Auth service directly.
     * Set your auth base URL in application.properties:
     * services.auth.base-url=http://localhost:8080
     */
    @Bean
    @Qualifier("authClient")
    public WebClient authClient(WebClient.Builder builder,
                                @Value("${services.auth.base-url}") String baseUrl) {
        return builder
                .baseUrl(baseUrl)
                .build();
    }
}
