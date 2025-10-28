package com.foodrescue.lots.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.reactive.CorsWebFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration cfg = new CorsConfiguration();
        // Frontend dev origin
        cfg.setAllowedOrigins(List.of("http://localhost:5173"));

        // Your UI makes GETs now; include all you’ll need
        cfg.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));

        // IMPORTANT: preflight needs to allow Authorization explicitly
        cfg.setAllowedHeaders(List.of("Authorization","Content-Type","X-Requested-With"));

        // You’re not sending cookies to the lots service, so credentials aren’t required.
        // If you later send cookies, set this to true and DO NOT use a wildcard origin.
        cfg.setAllowCredentials(false);

        // Cache preflight for a bit (optional)
        cfg.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return new CorsWebFilter(source);
    }
}
