package com.foodrescue.uibff.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.BearerTokenAuthenticationToken;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.ServerAuthenticationConverter;
import org.springframework.util.StringUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Configuration
public class SecurityConfig {

    private static final String ACCESS_COOKIE = "access_token";

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(
            ServerHttpSecurity http,
            @Qualifier("jwtAuthenticationConverter")
            Converter<Jwt, ? extends Mono<? extends AbstractAuthenticationToken>> jwtAuthenticationConverter
    ) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(c -> c.configurationSource(corsConfigurationSource()))
                .authorizeExchange(ex -> ex
                        .pathMatchers(HttpMethod.OPTIONS).permitAll()
                        .pathMatchers("/api/auth/login", "/api/auth/refresh", "/api/auth/logout").permitAll()
                        .pathMatchers("/api/addresses/**").permitAll()
                        .pathMatchers("/api/users").permitAll()
                        .pathMatchers("/api/code/generate", "/api/code/validate").permitAll()
                        .pathMatchers("/api/password/**").permitAll()
                        .pathMatchers("/api/auth/jwks", "/.well-known/jwks.json").permitAll()
                        .pathMatchers("/actuator/**").permitAll()
                        .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oauth -> oauth
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter))
                        // ⬇️ Use our cookie-first converter (no extra imports needed)
                        .bearerTokenConverter(cookieOrHeaderBearerTokenConverter())
                )
                .build();
    }

    /** Extract bearer token from HttpOnly 'access_token' cookie; fallback to Authorization header. */
    @Bean
    public ServerAuthenticationConverter cookieOrHeaderBearerTokenConverter() {
        return (ServerWebExchange exchange) -> {
            // 1) Prefer cookie
            HttpCookie cookie = exchange.getRequest().getCookies().getFirst(ACCESS_COOKIE);
            if (cookie != null && StringUtils.hasText(cookie.getValue())) {
                return Mono.just(new BearerTokenAuthenticationToken(cookie.getValue()));
            }
            // 2) Fallback to Authorization header (useful for Postman/dev)
            String auth = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (StringUtils.hasText(auth) && auth.regionMatches(true, 0, "Bearer ", 0, 7)) {
                return Mono.just(new BearerTokenAuthenticationToken(auth.substring(7)));
            }
            return Mono.empty();
        };
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of("http://localhost:5173"));
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }
}
