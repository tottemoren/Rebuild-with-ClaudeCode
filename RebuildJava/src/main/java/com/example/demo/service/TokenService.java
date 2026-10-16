package com.example.demo.service;

import java.time.Duration;
import java.time.Instant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import com.example.demo.entity.User;

/**
 * ログインした本人であることを示す合言葉（JWT）を発行する。
 * 中身：発行元（rebuild）、ユーザーID（sub）、ユーザー名、発行時刻、有効期限。
 */
@Service
public class TokenService {

    public static final String ISSUER = "rebuild";

    private final JwtEncoder jwtEncoder;
    private final Duration expiration;

    public TokenService(
            JwtEncoder jwtEncoder,
            @Value("${app.jwt.expiration-hours}") long expirationHours) {

        this.jwtEncoder = jwtEncoder;
        this.expiration = Duration.ofHours(expirationHours);
    }

    public String issue(User user) {
        Instant now = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(ISSUER)
                .subject(String.valueOf(user.getId()))
                .claim("username", user.getUsername())
                .issuedAt(now)
                .expiresAt(now.plus(expiration))
                .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();

        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
