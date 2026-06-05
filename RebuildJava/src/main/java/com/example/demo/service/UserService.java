package com.example.demo.service;

import org.springframework.stereotype.Service;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(
            UserRepository userRepository) {

        this.userRepository = userRepository;
    }

    public User register(
            String username,
            String password) {

        User user = new User();

        user.setUsername(username);
        user.setPassword(password);

        user.setRole("USER");

        return userRepository.save(user);
    }
}