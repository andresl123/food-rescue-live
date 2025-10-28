package com.foodrescue.uibff.http;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.*;
import reactor.core.publisher.Mono;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class StripAuthHeaderWebFilter implements WebFilter {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        var req = exchange.getRequest().mutate()
                .headers(h -> h.remove(HttpHeaders.AUTHORIZATION))
                .build();
        return chain.filter(exchange.mutate().request(req).build());
    }
}
