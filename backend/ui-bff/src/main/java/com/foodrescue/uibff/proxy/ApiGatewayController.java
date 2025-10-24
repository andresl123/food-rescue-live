package com.foodrescue.uibff.proxy;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * BFF proxy for non-auth microservices.
 * - Validates JWT & coarse RBAC in SecurityConfig (via your security starter)
 * - Relays Authorization header to downstream services (done by WebClient filter)
 * - Preserves query string and request body
 *
 * Configure base URLs in application.properties, e.g.:
 * services.jobs.base-url=http://localhost:8091
 * services.evidence.base-url=http://localhost:8092
 * services.orgs.base-url=http://localhost:8093
 * services.notifications.base-url=http://localhost:8094
 * services.lots.base-url=http://localhost:8095
 */
@RestController
@RequestMapping("/api")
public class ApiGatewayController {

    private final WebClient webClient;   // generic client (has auth-relay filter)
    private final ProxySupport proxy;

    @Value("${services.jobs.base-url:}")
    private String jobsBase;

    @Value("${services.evidence.base-url:}")
    private String evidenceBase;

    @Value("${services.orgs.base-url:}")
    private String orgsBase;

    @Value("${services.notifications.base-url:}")
    private String notificationsBase;

    // "lots" = lots-matching-service
    @Value("${services.lots.base-url:}")
    private String lotsBase;

    public ApiGatewayController(WebClient webClient, ProxySupport proxy) {
        this.webClient = webClient;
        this.proxy = proxy;
    }

    // ---------------- helper ----------------

    private String stripApiPrefix(ServerWebExchange exchange) {
        // incoming path like /api/jobs/123  ->  /jobs/123
        return exchange.getRequest().getURI().getPath().replaceFirst("^/api", "");
    }

    private WebClient clientFor(String base) {
        if (base == null || base.isBlank()) {
            // build a no-base client (you could also return Mono.error in callers)
            return webClient;
        }
        return webClient.mutate().baseUrl(base).build();
    }

    private Mono<String> forwardToBase(
            String base,
            ServerWebExchange exchange,
            String body,
            MediaType contentType
    ) {
        String path = stripApiPrefix(exchange); // e.g. /jobs/123
        MultiValueMap<String, String> query = exchange.getRequest().getQueryParams();
        HttpMethod method = exchange.getRequest().getMethod();

        return proxy.forward(
                clientFor(base),
                method,
                path,
                query,
                body,
                contentType,
                exchange
        );
    }

    // -------------- service routes --------------

    @RequestMapping(
            path = "/jobs/**",
            method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE}
    )
    public Mono<String> jobs(
            @RequestBody(required = false) String body,
            @RequestHeader(name = "Content-Type", required = false) MediaType contentType,
            ServerWebExchange exchange
    ) {
        return forwardToBase(jobsBase, exchange, body, contentType);
    }

    @RequestMapping(
            path = "/evidence/**",
            method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE}
    )
    public Mono<String> evidence(
            @RequestBody(required = false) String body,
            @RequestHeader(name = "Content-Type", required = false) MediaType contentType,
            ServerWebExchange exchange
    ) {
        return forwardToBase(evidenceBase, exchange, body, contentType);
    }

    @RequestMapping(
            path = "/orgs/**",
            method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE}
    )
    public Mono<String> orgs(
            @RequestBody(required = false) String body,
            @RequestHeader(name = "Content-Type", required = false) MediaType contentType,
            ServerWebExchange exchange
    ) {
        return forwardToBase(orgsBase, exchange, body, contentType);
    }

    @RequestMapping(
            path = "/notifications/**",
            method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE}
    )
    public Mono<String> notifications(
            @RequestBody(required = false) String body,
            @RequestHeader(name = "Content-Type", required = false) MediaType contentType,
            ServerWebExchange exchange
    ) {
        return forwardToBase(notificationsBase, exchange, body, contentType);
    }

    // lots-matching-service (expose via /api/lots/**)
    @RequestMapping(
            path = "/lots/**",
            method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE}
    )
    public Mono<String> lots(
            @RequestBody(required = false) String body,
            @RequestHeader(name = "Content-Type", required = false) MediaType contentType,
            ServerWebExchange exchange
    ) {
        return forwardToBase(lotsBase, exchange, body, contentType);
    }
}
