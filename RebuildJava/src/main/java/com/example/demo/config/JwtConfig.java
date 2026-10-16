package com.example.demo.config;

import java.nio.charset.StandardCharsets;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import com.nimbusds.jose.jwk.source.ImmutableSecret;

/**
 * ログインで発行する合言葉（JWT）の署名と確認に使う鍵の設定。
 *
 * 鍵は公開リポジトリに書かないよう、環境変数 JWT_SECRET から受け取る。
 * 未設定や短すぎる鍵のまま動くと、合言葉を偽造されるおそれがあるため、
 * その場合はアプリを起動させない（設定し忘れに、すぐ気づけるようにする）。
 */
@Configuration
public class JwtConfig {

    // HS256 で安全に使うには、32バイト（半角32文字）以上の鍵が必要
    private static final int MIN_SECRET_BYTES = 32;

    private final SecretKey secretKey;

    public JwtConfig(@Value("${app.jwt.secret:}") String secret) {
        byte[] bytes = secret.trim().getBytes(StandardCharsets.UTF_8);

        if (bytes.length < MIN_SECRET_BYTES) {
            throw new IllegalStateException(
                    "環境変数 JWT_SECRET が未設定か短すぎます（32文字以上が必要）。"
                            + "compose.yml と同じ場所の .env に設定してから起動してください。");
        }

        this.secretKey = new SecretKeySpec(bytes, "HmacSHA256");
    }

    @Bean
    public JwtEncoder jwtEncoder() {
        return new NimbusJwtEncoder(new ImmutableSecret<>(secretKey));
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withSecretKey(secretKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }
}
