package com.foodrescue.auth.crypto;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.KeyUse;
import com.nimbusds.jose.jwk.RSAKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;

@Component
public class KeyProvider {

    private final RSAKey rsaJwk;   // contains both public + private
    private final String kid;

    public KeyProvider(
            @Value("${jwt.private-key-pem:}") String privateKeyPem,
            @Value("${jwt.public-key-pem:}")  String publicKeyPem) {
        try {
            RSAKey base;
            if (!privateKeyPem.isBlank() && !publicKeyPem.isBlank()) {
                var priv = (RSAPrivateKey) PemUtils.readPrivateKeyFromPem(privateKeyPem);
                var pub  = (RSAPublicKey)  PemUtils.readPublicKeyFromPem(publicKeyPem);
                base = new RSAKey.Builder(pub).privateKey(priv).build();
            } else {
                var gen = KeyPairGenerator.getInstance("RSA");
                gen.initialize(2048);
                var kp = gen.generateKeyPair();
                base = new RSAKey.Builder((RSAPublicKey) kp.getPublic())
                        .privateKey((RSAPrivateKey) kp.getPrivate())
                        .build();
                System.out.println("[JWT] Using ephemeral dev keypair (no PEMs provided).");
            }

            // Compute kid once from the PUBLIC JWK thumbprint (stable)
            String thumb = base.computeThumbprint().toString(); // base64url
            this.kid = thumb;

            this.rsaJwk = new RSAKey.Builder(base.toRSAPublicKey())
                    .privateKey(base.toRSAPrivateKey())
                    .keyUse(KeyUse.SIGNATURE)
                    .algorithm(JWSAlgorithm.RS256)
                    .keyID(this.kid)
                    .build();

            System.out.println("[JWT] Active KID = " + this.kid);
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize RSA keys", e);
        }
    }

    public RSAKey rsaJwk() { return rsaJwk; }
    public String kid()     { return kid; }
    public JWKSet jwkSet()  { return new JWKSet(rsaJwk.toPublicJWK()); }
}
