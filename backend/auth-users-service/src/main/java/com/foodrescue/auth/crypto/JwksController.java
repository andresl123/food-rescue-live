package com.foodrescue.auth.crypto;

import com.nimbusds.jose.jwk.JWKSet;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class JwksController {

    private final KeyProvider keys;

    public JwksController(KeyProvider keys) {
        this.keys = keys;
    }

    // BFF will fetch this
    @GetMapping("/.well-known/jwks.json")
    public Map<String, Object> jwks() {
        JWKSet set = keys.jwkSet();
        return set.toJSONObject(true); // public only
    }
}
