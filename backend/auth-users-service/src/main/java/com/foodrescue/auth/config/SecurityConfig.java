package com.foodrescue.auth.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
public class SecurityConfig {

    private final RevokedJwtValidator revokedValidator;

    public SecurityConfig(RevokedJwtValidator revokedValidator) {
        this.revokedValidator = revokedValidator;
    }

    // ===== JWT Decoder via JWKS + issuer/audience validation =====
    @Bean
    public ReactiveJwtDecoder jwtDecoder(
            @Value("${jwt.jwks-uri}") String jwksUri,
            @Value("${jwt.issuer}") String issuer,
            @Value("${jwt.audience}") String expectedAudience
    ) {
        // Fetch keys from JWKS; the 'kid' in the token header will be matched automatically.
        NimbusReactiveJwtDecoder decoder = NimbusReactiveJwtDecoder.withJwkSetUri(jwksUri).build();

        // Default validations (exp, nbf)
        OAuth2TokenValidator<Jwt> defaults = JwtValidators.createDefault();

        // Issuer validation
        OAuth2TokenValidator<Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(issuer);

        // Audience validation
        OAuth2TokenValidator<Jwt> withAudience = jwt -> {
            List<String> aud = jwt.getAudience();
            boolean ok = aud != null && aud.contains(expectedAudience);
            return ok
                    ? OAuth2TokenValidatorResult.success()
                    : OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_token", "invalid audience", null)
            );
        };

        // Compose: defaults (exp/nbf) + issuer + audience + revoked-token check
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(defaults, withIssuer, withAudience, revokedValidator));
        return decoder;
    }

    /** Map "roles" claim → ROLE_* authorities. */
    @Bean
    public Converter<Jwt, Mono<AbstractAuthenticationToken>> authenticationConverter() {
        JwtAuthenticationConverter delegate = new JwtAuthenticationConverter();
        delegate.setJwtGrantedAuthoritiesConverter(this::extractAuthorities);
        return new ReactiveJwtAuthenticationConverterAdapter(delegate);
    }

    private Collection<GrantedAuthority> extractAuthorities(Jwt jwt) {
        Object claim = jwt.getClaims().get("roles");
        if (claim instanceof List<?> list) {
            return list.stream()
                    .map(Object::toString)
                    .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());
        }
        return List.of();
    }

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(
            ServerHttpSecurity http,
            Converter<Jwt, Mono<AbstractAuthenticationToken>> authConverter
    ) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(ServerHttpSecurity.CorsSpec::disable)

                .authorizeExchange(ex -> ex
                        .pathMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
                        .pathMatchers(HttpMethod.POST, "/api/v1/auth/logout").permitAll()
                        .pathMatchers(HttpMethod.POST, "/api/v1/auth/refresh").permitAll()
                        .pathMatchers("/.well-known/jwks.json").permitAll()
                        .pathMatchers("/actuator/health", "/v3/api-docs/**", "/swagger-ui/**").permitAll()
                        .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oauth -> oauth
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(authConverter))
                        // Ensure auth failures are 401/403 JSON, not 500s
                        .authenticationEntryPoint((exchange, ex) ->
                                writeJson(exchange.getResponse(), HttpStatus.UNAUTHORIZED,
                                        "{\"success\":false,\"message\":\"unauthorized\"}"))
                        .accessDeniedHandler((exchange, ex) ->
                                writeJson(exchange.getResponse(), HttpStatus.FORBIDDEN,
                                        "{\"success\":false,\"message\":\"forbidden\"}"))
                )
                .build();
    }

    private Mono<Void> writeJson(ServerHttpResponse res, HttpStatus status, String body) {
        res.setStatusCode(status);
        res.getHeaders().set("Content-Type", "application/json");
        var buf = res.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
        return res.writeWith(Mono.just(buf));
    }
}
