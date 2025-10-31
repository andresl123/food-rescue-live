package com.foodrescue.lots.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;

@Configuration
@EnableReactiveMethodSecurity // enables @PreAuthorize in WebFlux
public class MethodSecurityConfig {
}
