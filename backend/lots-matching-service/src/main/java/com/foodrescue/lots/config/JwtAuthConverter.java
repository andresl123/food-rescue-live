package com.foodrescue.lots.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthConverter implements Converter<Jwt, Mono<AbstractAuthenticationToken>> {

    @Override
    public Mono<AbstractAuthenticationToken> convert(Jwt jwt) {
        Collection<GrantedAuthority> authorities = extractAuthorities(jwt);
        return Mono.just(new JwtAuthenticationToken(jwt, authorities));
    }

    private Collection<GrantedAuthority> extractAuthorities(Jwt jwt) {
        // Get the "roles" claim from the JWT payload
        Object rolesClaim = jwt.getClaims().get("roles");

        if (rolesClaim instanceof Collection<?> roles) {
            return roles.stream()
                    .map(Object::toString)
                    // Add the "ROLE_" prefix, which Spring Security expects
                    .map(role -> "ROLE_" + role)
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());
        }

        // Return an empty list if no roles are found
        return List.of();
    }
}