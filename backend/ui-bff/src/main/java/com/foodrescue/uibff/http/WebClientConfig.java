package com.foodrescue.uibff.http;

import com.foodrescue.uibff.auth.Cookies;
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

    /** Always set outbound Authorization from access_token cookie (ignore any incoming header). */
    private ExchangeFilterFunction authFromCookieOnlyFilter() {
        return (request, next) -> Mono.deferContextual(ctx -> {
            ServerWebExchange ex = ctx.getOrDefault(ServerWebExchange.class, null);
            ClientRequest.Builder b = ClientRequest.from(request);

            // Enforce cookie-only policy
            b.headers(h -> h.remove(HttpHeaders.AUTHORIZATION));

            if (ex != null) {
                var accessCookie = ex.getRequest().getCookies().getFirst(Cookies.ACCESS_COOKIE);
                if (accessCookie != null && !accessCookie.getValue().isBlank()) {
                    b.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessCookie.getValue());
                }
            }
            return next.exchange(b.build());
        });
    }

    /** On 401: refresh via refresh cookie; rewrite BOTH cookies; retry once. */
    private ExchangeFilterFunction refreshOn401Filter(RefreshService refreshService) {
        return (request, next) ->
                next.exchange(request).flatMap(response -> {
                    if (response.statusCode() != HttpStatus.UNAUTHORIZED) {
                        return Mono.just(response);
                    }
                    return Mono.deferContextual(ctx -> {
                        ServerWebExchange exchange = ctx.getOrDefault(ServerWebExchange.class, null);
                        if (exchange == null) return Mono.just(response);
                        if (Boolean.TRUE.equals(request.attribute("retried").orElse(false))) {
                            return Mono.just(response);
                        }

                        String currentAccess = request.headers().getFirst(HttpHeaders.AUTHORIZATION);

                        return refreshService.refreshTokens(exchange, currentAccess)
                                .flatMap(newAccess -> {
                                    ClientRequest retry = ClientRequest.from(request)
                                            .headers(h -> {
                                                h.remove(HttpHeaders.AUTHORIZATION);
                                                h.set(HttpHeaders.AUTHORIZATION, "Bearer " + newAccess);
                                            })
                                            .attribute("retried", true)
                                            .build();
                                    return next.exchange(retry);
                                })
                                .switchIfEmpty(Mono.just(response));
                    });
                });
    }

    @Bean
    @Primary
    public WebClient webClient(WebClient.Builder builder, RefreshService refreshService) {
        return builder
                .filter(authFromCookieOnlyFilter())
                .filter(refreshOn401Filter(refreshService))
                .build();
    }

    /** Clean client for Auth (no filters) to avoid recursion during login/refresh. */
    @Bean
    @Qualifier("authClient")
    public WebClient authClient(WebClient.Builder builder,
                                @Value("${services.auth.base-url}") String baseUrl) {
        return builder.baseUrl(baseUrl).build();
    }
}
