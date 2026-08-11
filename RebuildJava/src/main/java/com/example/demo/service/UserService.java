package com.example.demo.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(
            String username,
            String password) {

        User user = new User();

        user.setUsername(username);

        // DBを見られてもパスワードの中身が分からないよう、ハッシュ化してから保存する
        user.setPassword(
                passwordEncoder.encode(password));

        user.setRole("USER");

        return userRepository.save(user);
    }

    public User updateProfileImage(
            Long userId,
            String profileImageUrl) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "ユーザーが見つかりません: " + userId));

        user.setProfileImageUrl(profileImageUrl);

        return userRepository.save(user);
    }
}