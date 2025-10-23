package com.foodrescue.lots.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import reactor.core.publisher.Mono;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import java.nio.charset.StandardCharsets;

import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.List;

@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
public class SecurityConfig {

    private final RevokedJwtValidator revokedValidator;
    private final Converter<Jwt, Mono<AbstractAuthenticationToken>> authConverter;

    public SecurityConfig(RevokedJwtValidator revokedValidator, Converter<Jwt, Mono<AbstractAuthenticationToken>> authConverter) {
        this.revokedValidator = revokedValidator;
        this.authConverter = authConverter;
    }

    private Mono<Void> writeJson(ServerHttpResponse res, HttpStatus status, String body) {
        res.setStatusCode(status);
        res.getHeaders().set("Content-Type", "application/json");
        // Get the response buffer factory and wrap the body string (encoded in UTF-8)
        var buf = res.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
        // Write the buffer to the response and return the completion signal
        return res.writeWith(Mono.just(buf));
    }

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(
            ServerHttpSecurity http,
            ReactiveJwtDecoder jwtDecoder
    ) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeExchange(ex -> ex
                        .pathMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
                        .pathMatchers(HttpMethod.POST, "/api/v1/auth/logout").permitAll()
                        .pathMatchers(HttpMethod.POST, "/api/v1/auth/refresh").permitAll()
                        .pathMatchers(HttpMethod.POST, "/api/code/generate").permitAll()
                        .pathMatchers(HttpMethod.POST, "/api/password/reset/**").permitAll()
                        .pathMatchers("/actuator/health", "/v3/api-docs/**", "/swagger-ui/**").permitAll()
                        .pathMatchers(HttpMethod.POST, "/api/v1/lots").hasRole("DONOR")
                        .pathMatchers(HttpMethod.PUT, "/api/v1/lots/{lotId}").hasRole("DONOR") // Allow updating lots
                        .pathMatchers(HttpMethod.DELETE, "/api/v1/lots/{lotId}").hasRole("DONOR") // Allow deleting lots
                        .pathMatchers(HttpMethod.POST, "/api/v1/lots/{lotId}/items").hasRole("DONOR") // Allow adding items
                        .pathMatchers(HttpMethod.PUT, "/api/v1/lots/{lotId}/items/{itemId}").hasRole("DONOR") // Allow updating items
                        .pathMatchers(HttpMethod.DELETE, "/api/v1/lots/{lotId}/items/{itemId}").hasRole("DONOR") // Allow deleting items
                        .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oauth -> oauth
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(authConverter).jwtDecoder(jwtDecoder)) // This part validates the token

                        // --- THIS IS THE HANDLER FOR INCORRECT/MISSING TOKENS ---
                        .authenticationEntryPoint((exchange, ex) ->
                                writeJson(exchange.getResponse(), HttpStatus.UNAUTHORIZED, // Returns 401 status
                                        "{\"success\":false,\"message\":\"unauthorized\"}")) // Returns this JSON body

                        .accessDeniedHandler((exchange, ex) -> // This handles valid tokens with insufficient permissions (403)
                                writeJson(exchange.getResponse(), HttpStatus.FORBIDDEN,
                                        "{\"success\":false,\"message\":\"forbidden\"}"))
                )
                .build();
    }

    @Bean
    public ReactiveJwtDecoder jwtDecoder(
            @Value("${jwt.public-key-pem}") String publicKeyPem,
            @Value("${jwt.issuer}") String issuer,
            @Value("${jwt.audience}") String expectedAudience
    ) {
        try {
            // --- FIX #2: Correctly parse the key string from properties ---
            String publicKeyContent = publicKeyPem
                    .replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "")
                    .replaceAll("\\s+", ""); // This removes all whitespace, including newlines (\n)

            KeyFactory kf = KeyFactory.getInstance("RSA");
            X509EncodedKeySpec keySpecX509 = new X509EncodedKeySpec(Base64.getDecoder().decode(publicKeyContent));
            RSAPublicKey publicKey = (RSAPublicKey) kf.generatePublic(keySpecX509);

            NimbusReactiveJwtDecoder decoder = NimbusReactiveJwtDecoder.withPublicKey(publicKey).build();

            OAuth2TokenValidator<Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(issuer);
            OAuth2TokenValidator<Jwt> withAudience = jwt -> {
                List<String> aud = jwt.getAudience();
                return aud != null && aud.contains(expectedAudience)
                        ? OAuth2TokenValidatorResult.success()
                        : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "Invalid audience", null));
            };

            decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(withIssuer, withAudience, revokedValidator));
            return decoder;

        } catch (Exception e) {
            // We add the original error to the message for better debugging
            throw new RuntimeException("Failed to configure JWT decoder: " + e.getMessage(), e);
        }
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:5174")); // Allow your frontend port(s)
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}