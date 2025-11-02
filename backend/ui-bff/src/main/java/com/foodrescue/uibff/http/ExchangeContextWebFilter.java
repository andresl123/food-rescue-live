package com.foodrescue.uibff.http;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * Makes the current ServerWebExchange available in Reactor Context for downstream operators,
 * including WebClient filters.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ExchangeContextWebFilter implements WebFilter {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        return chain.filter(exchange)
                .contextWrite(ctx -> ctx.put(ServerWebExchange.class, exchange));
    }
}
