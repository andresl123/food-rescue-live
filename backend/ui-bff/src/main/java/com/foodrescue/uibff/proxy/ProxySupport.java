package com.foodrescue.uibff.proxy;

import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class ProxySupport {

    public Mono<String> forward(
            WebClient client,
            HttpMethod method,
            String path,
            MultiValueMap<String, String> query,
            String body,
            MediaType contentType,
            ServerWebExchange exchange
    ) {
        return client
                .method(method)
                .uri(uriBuilder -> {
                    var b = uriBuilder.path(path);
                    if (query != null) b.queryParams(query);
                    return b.build();
                })
                .contentType(contentType == null ? MediaType.APPLICATION_JSON : contentType)
                .body((body == null || body.isBlank())
                        ? BodyInserters.empty()
                        : BodyInserters.fromValue(body))
                .retrieve()
                .bodyToMono(String.class)
                .contextWrite(ctx -> ctx.put(ServerWebExchange.class, exchange));
    }

    public Mono<String> forwardForm(
            WebClient client,
            HttpMethod method,
            String path,
            MultiValueMap<String, String> form,
            ServerWebExchange exchange
    ) {
        return client
                .method(method)
                .uri(path)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData(form))
                .retrieve()
                .bodyToMono(String.class)
                .contextWrite(ctx -> ctx.put(ServerWebExchange.class, exchange));
    }
}
