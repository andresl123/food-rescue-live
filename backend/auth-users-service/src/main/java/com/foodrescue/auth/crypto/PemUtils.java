package com.foodrescue.auth.crypto;

import java.security.KeyFactory;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

final class PemUtils {

    static RSAPrivateKey readPrivateKeyFromPem(String pem) throws Exception {
        // 1) normalize common variants from application.properties
        String normalized = pem
                .replace("\\n", "\n")  // turn literal \n into real newlines
                .replace("\r", "")     // drop CR
                .trim();

        // 2) must be PKCS#8: -----BEGIN PRIVATE KEY-----
        if (!normalized.contains("BEGIN PRIVATE KEY"))
            throw new IllegalArgumentException("Private key must be PKCS#8 (BEGIN PRIVATE KEY)");

        String content = normalized
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s", ""); // remove all whitespace now that newlines are normalized

        byte[] pkcs8 = Base64.getDecoder().decode(content);
        var kf = KeyFactory.getInstance("RSA");
        return (RSAPrivateKey) kf.generatePrivate(new PKCS8EncodedKeySpec(pkcs8));
    }

    static RSAPublicKey readPublicKeyFromPem(String pem) throws Exception {
        String normalized = pem
                .replace("\\n", "\n")
                .replace("\r", "")
                .trim();

        // must be X.509 public key: -----BEGIN PUBLIC KEY-----
        if (!normalized.contains("BEGIN PUBLIC KEY"))
            throw new IllegalArgumentException("Public key must be X.509 (BEGIN PUBLIC KEY)");

        String content = normalized
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s", "");

        byte[] x509 = Base64.getDecoder().decode(content);
        var kf = KeyFactory.getInstance("RSA");
        return (RSAPublicKey) kf.generatePublic(new X509EncodedKeySpec(x509));
    }

    private PemUtils() {}
}
