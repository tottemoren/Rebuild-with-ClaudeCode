package com.example.demo.dto;

import com.example.demo.entity.User;

/**
 * ログインの返事。
 * 合言葉を発行する前のフロントエンドもそのまま動くよう、これまで返していたユーザー情報と同じ項目に、token を足した形にしている。
 */
public record LoginResponse(
        Long id,
        String username,
        String role,
        String profileImageUrl,
        String token) {

    public static LoginResponse of(User user, String token) {
        return new LoginResponse(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                user.getProfileImageUrl(),
                token);
    }
}
