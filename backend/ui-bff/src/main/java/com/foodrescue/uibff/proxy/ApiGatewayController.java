package com.foodrescue.uibff.proxy;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.ConnectException;
import java.net.UnknownHostException;
import java.nio.charset.StandardCharsets;

//@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")

@RestController
@RequestMapping("/api")
public class ApiGatewayController {

    private static final Logger log = LoggerFactory.getLogger(ApiGatewayController.class);

    /**
     * NOTE: this WebClient already has your filters:
     * - read access token from cookies/session
     * - proactive refresh on 401
     * - strip/restore Authorization header, etc.
     */
    private final WebClient webClient;

    @Value("${services.auth.base-url:}")          private String authBase;
    @Value("${services.jobs.base-url:}")          private String jobsBase;
    @Value("${services.evidence.base-url:}")      private String evidenceBase;
    @Value("${services.orgs.base-url:}")          private String orgsBase;
    @Value("${services.notifications.base-url:}") private String notificationsBase;
    @Value("${services.lots.base-url:}")          private String lotsBase;

    public ApiGatewayController(WebClient webClient) {
        this.webClient = webClient;
    }

    /* ----------------- Helpers ----------------- */

    private WebClient clientFor(String base) {
        return (base == null || base.isBlank())
                ? webClient
                : webClient.mutate().baseUrl(base).build();
    }

    private static boolean hasBody(HttpMethod m) {
        return m == HttpMethod.POST || m == HttpMethod.PUT || m == HttpMethod.PATCH;
    }

    private String stripApiPrefix(ServerWebExchange exchange) {
        // e.g. /api/jobs/... -> /jobs/...
        return exchange.getRequest().getURI().getPath().replaceFirst("^/api", "");
    }

    /**
     * Core forwarder that:
     * - builds downstream URL (base + path)
     * - forwards query params and Content-Type
     * - uses exchangeToMono to avoid throwing on 4xx/5xx
     * - returns ResponseEntity<byte[]> with exact status/body/Content-Type
     */
    private Mono<ResponseEntity<byte[]>> forward(
            String base,
            ServerWebExchange exchange,
            String downstreamPath,                // path at the downstream service
            String body,
            MediaType contentType) {

        HttpMethod method = exchange.getRequest().getMethod();
        MultiValueMap<String, String> query = exchange.getRequest().getQueryParams();

        WebClient.RequestBodySpec spec = clientFor(base)
                .method(method)
                .uri(builder -> builder.path(downstreamPath).queryParams(query).build())
                .headers(h -> {
                    if (contentType != null) {
                        h.setContentType(contentType);
                    }
                    // You could also forward Accept, correlation IDs, etc. here if needed.
                });

        WebClient.ResponseSpec responseSpec;
        if (hasBody(method) && body != null) {
            responseSpec = spec.bodyValue(body).retrieve(); // body is already a String (JSON/form)
        } else {
            responseSpec = spec.retrieve();
        }

        // Use exchangeToMono to get status + headers + body without converting to exceptions
        return spec.exchangeToMono(resp ->
                        resp.bodyToMono(byte[].class)
                                .defaultIfEmpty(new byte[0])
                                .map(bytes -> {
                                    ResponseEntity.BodyBuilder b = ResponseEntity.status(resp.statusCode());
                                    MediaType ct = resp.headers().contentType().orElse(null);
                                    if (ct != null) b.contentType(ct);
                                    return b.body(bytes);
                                }))
                // Safety net: if something still throws (e.g., retrieve() prefetch), map it properly
                .onErrorResume(WebClientResponseException.class, ex -> {
                    HttpHeaders h = new HttpHeaders();
                    String ct = ex.getHeaders().getFirst(HttpHeaders.CONTENT_TYPE);
                    if (ct != null) h.set(HttpHeaders.CONTENT_TYPE, ct);
                    return Mono.just(new ResponseEntity<>(ex.getResponseBodyAsByteArray(), h, ex.getStatusCode()));
                })
                .onErrorResume(UnknownHostException.class, ex ->
                        Mono.just(ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(("{\"error\":\"Upstream host not found\"}").getBytes(StandardCharsets.UTF_8))))
                .onErrorResume(ConnectException.class, ex ->
                        Mono.just(ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(("{\"error\":\"Upstream service unavailable\"}").getBytes(StandardCharsets.UTF_8))))
                .onErrorResume(Throwable.class, ex -> {
                    log.error("Gateway forwarding error", ex);
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(("{\"error\":\"Internal Server Error\"}").getBytes(StandardCharsets.UTF_8)));
                });
    }

    /* ----------------- Routes ----------------- */

    @RequestMapping(
            path = "/jobs/**",
            method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE}
    )
    public Mono<ResponseEntity<byte[]>> jobs(@RequestBody(required = false) String body,
                                             @RequestHeader(name = "Content-Type", required = false) MediaType contentType,
                                             ServerWebExchange exchange) {
        String incoming = exchange.getRequest().getURI().getPath();
        String afterApi = incoming.replaceFirst("^/api", "");
        String downstreamPath = afterApi.replaceFirst("^/jobs", "/api/v1/jobs");
        return forward(jobsBase, exchange, downstreamPath, body, contentType);
    }

    @RequestMapping(
            path = "/evidence/**",
            method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE}
    )
    public Mono<ResponseEntity<byte[]>> evidence(@RequestBody(required = false) String body,
                                                 @RequestHeader(name = "Content-Type", required = false) MediaType contentType,
                                                 ServerWebExchange exchange) {
        // /api/evidence/...   ->  /api/v1/...
        String incoming = exchange.getRequest().getURI().getPath();
        String afterApi = incoming.replaceFirst("^/api", "");
        String downstreamPath = afterApi.replaceFirst("^/evidence", "/api/v1");
        return forward(evidenceBase, exchange, downstreamPath, body, contentType);
    }

    @RequestMapping(
            path = "/orgs/**",
            method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE}
    )
    public Mono<ResponseEntity<byte[]>> orgs(@RequestBody(required = false) String body,
                                             @RequestHeader(name = "Content-Type", required = false) MediaType contentType,
                                             ServerWebExchange exchange) {
        String downstreamPath = stripApiPrefix(exchange); // /orgs/...
        return forward(orgsBase, exchange, downstreamPath, body, contentType);
    }

    @RequestMapping(
            path = "/notifications/**",
            method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE}
    )
    public Mono<ResponseEntity<byte[]>> notifications(@RequestBody(required = false) String body,
                                                      @RequestHeader(name = "Content-Type", required = false) MediaType contentType,
                                                      ServerWebExchange exchange) {
        String downstreamPath = stripApiPrefix(exchange); // /notifications/...
        return forward(notificationsBase, exchange, downstreamPath, body, contentType);
    }

    @RequestMapping(
            path = "/lots/**",
            method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE}
    )
    public Mono<ResponseEntity<byte[]>> lots(@RequestBody(required = false) String body,
                                             @RequestHeader(name = "Content-Type", required = false) MediaType contentType,
                                             ServerWebExchange exchange) {
        String incoming = exchange.getRequest().getURI().getPath();
        String afterApi = incoming.replaceFirst("^/api", "");
        String downstreamPath = afterApi.replaceFirst("^/lots", "/api/v1/lots");
        return forward(lotsBase, exchange, downstreamPath, body, contentType);
    }

    @RequestMapping(
            path = "/addresses/**",
            method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE}
    )
    public Mono<ResponseEntity<byte[]>> addresses(@RequestBody(required = false) String body,
                                                  @RequestHeader(name = "Content-Type", required = false) MediaType contentType,
                                                  ServerWebExchange exchange) {
        // /api/addresses/... → /api/v1/addresses/...
        String incoming = exchange.getRequest().getURI().getPath();
        String afterApi = incoming.replaceFirst("^/api", "");
        String downstreamPath = afterApi.replaceFirst("^/addresses", "/api/v1/addresses");
        return forward(authBase, exchange, downstreamPath, body, contentType);
    }

    @RequestMapping(
            path = "/users/**",
            method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE}
    )
    public Mono<ResponseEntity<byte[]>> users(@RequestBody(required = false) String body,
                                              @RequestHeader(name = "Content-Type", required = false) MediaType contentType,
                                              ServerWebExchange exchange) {
        // /api/users/... → /api/v1/users/...
        String incoming = exchange.getRequest().getURI().getPath();
        String afterApi = incoming.replaceFirst("^/api", "");
        String downstreamPath = afterApi.replaceFirst("^/users", "/api/v1/users");
        return forward(authBase, exchange, downstreamPath, body, contentType);
    }

    @RequestMapping(
            path = "/code/**",
            method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE}
    )
    public Mono<ResponseEntity<byte[]>> code(@RequestBody(required = false) String body,
                                             @RequestHeader(name = "Content-Type", required = false) MediaType contentType,
                                             ServerWebExchange exchange) {
        // /api/code/... → /api/v1/code/...
        String incoming = exchange.getRequest().getURI().getPath();
        String afterApi = incoming.replaceFirst("^/api", "");
        String downstreamPath = afterApi.replaceFirst("^/code", "/api/code");
        return forward(authBase, exchange, downstreamPath, body, contentType);
    }

    @RequestMapping(
            path = "/password/**",
            method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE}
    )
    public Mono<ResponseEntity<byte[]>> password(@RequestBody(required = false) String body,
                                                 @RequestHeader(name = "Content-Type", required = false) MediaType contentType,
                                                 ServerWebExchange exchange) {
        // /api/password/... → /api/v1/password/...
        String incoming = exchange.getRequest().getURI().getPath();
        String afterApi = incoming.replaceFirst("^/api", "");
        String downstreamPath = afterApi.replaceFirst("^/password", "/api/password");
        return forward(authBase, exchange, downstreamPath, body, contentType);
    }


}
