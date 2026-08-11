package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * これまでこのアプリには認証の仕組みが無く、パスワードも平文で保存・比較されていた。
 *
 * ここでは大がかりなログイン方式の変更（セッションやJWT導入など）はせず、
 * 最小限だけ Spring Security を導入する。
 *
 * - パスワードは BCryptPasswordEncoder でハッシュ化して保存・照合する
 * - 既存のフロントエンド（/login や /api/users/register を直接 fetch している）が
 *   そのまま動くように、全エンドポイントへのアクセスは許可したままにする
 *   （＝挙動を変えずに「保存されるパスワードの安全性」だけを底上げする）
 *
 * 将来的にセッション認証やJWT認証に発展させる場合は、authorizeHttpRequests の
 * permitAll() を必要な範囲だけに絞り込んでいくとよい。
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            // フロントエンドは Cookie を使わない fetch ベースの API なので CSRF 保護は不要
            .csrf(csrf -> csrf.disable())
            // 既存の @CrossOrigin 設定をそのまま活かす
            .cors(Customizer.withDefaults())
            // 今回のスコープでは「誰でもアクセスできる」挙動を変えない
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
            .httpBasic(basic -> basic.disable())
            .formLogin(form -> form.disable());

        return http.build();
    }
}
