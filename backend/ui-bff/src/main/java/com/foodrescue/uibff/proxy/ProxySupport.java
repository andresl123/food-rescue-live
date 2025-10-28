package com.foodrescue.uibff.proxy;

import com.foodrescue.uibff.auth.Cookies;
import org.springframework.http.HttpHeaders;
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

    private static boolean methodSupportsBody(HttpMethod method) {
        return method == HttpMethod.POST || method == HttpMethod.PUT || method == HttpMethod.PATCH;
    }

    public Mono<String> forward(
            WebClient client,
            HttpMethod method,
            String path,
            MultiValueMap<String, String> query,
            String body,
            MediaType contentType,
            ServerWebExchange exchange
    ) {
        return Mono.defer(() -> {
            WebClient.RequestBodySpec req = client
                    .method(method)
                    .uri(builder -> {
                        var b = builder.path(path);
                        if (query != null) b.queryParams(query);
                        return b.build();
                    })
                    .accept(MediaType.APPLICATION_JSON)
                    // Fallback: if WebClient filters didn’t inject Authorization, do it here.
                    .headers(h -> {
                        if (!h.containsKey(HttpHeaders.AUTHORIZATION) && exchange != null) {
                            var access = exchange.getRequest().getCookies().getFirst(Cookies.ACCESS_COOKIE);
                            if (access != null && !access.getValue().isBlank()) {
                                h.set(HttpHeaders.AUTHORIZATION, "Bearer " + access.getValue());
                            }
                        }
                    });

            boolean hasBody = body != null && !body.isBlank();

            if (methodSupportsBody(method) && hasBody) {
                MediaType ct = (contentType == null ? MediaType.APPLICATION_JSON : contentType);
                return req.contentType(ct)
                        .body(BodyInserters.fromValue(body))
                        .retrieve()
                        .bodyToMono(String.class);
            } else if (method == HttpMethod.DELETE && hasBody) {
                MediaType ct = (contentType == null ? MediaType.APPLICATION_JSON : contentType);
                return req.contentType(ct)
                        .body(BodyInserters.fromValue(body))
                        .retrieve()
                        .bodyToMono(String.class);
            } else {
                return req.retrieve().bodyToMono(String.class);
            }
        });
        // No contextWrite here; ExchangeContextWebFilter does it globally.
    }

    public Mono<String> forwardForm(
            WebClient client,
            HttpMethod method,
            String path,
            MultiValueMap<String, String> form,
            ServerWebExchange exchange
    ) {
        return Mono.defer(() ->
                client.method(method)
                        .uri(builder -> builder.path(path).build())
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .headers(h -> {
                            if (!h.containsKey(HttpHeaders.AUTHORIZATION) && exchange != null) {
                                var access = exchange.getRequest().getCookies().getFirst(Cookies.ACCESS_COOKIE);
                                if (access != null && !access.getValue().isBlank()) {
                                    h.set(HttpHeaders.AUTHORIZATION, "Bearer " + access.getValue());
                                }
                            }
                        })
                        .body(BodyInserters.fromFormData(form))
                        .retrieve()
                        .bodyToMono(String.class)
        );
    }
}
