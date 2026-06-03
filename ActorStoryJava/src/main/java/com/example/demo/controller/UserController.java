package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.RegisterRequest;
import com.example.demo.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;

    public UserController(
            UserService userService) {

        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(

            @RequestBody
            RegisterRequest request) {

        if (!"ActorStory2026"
                .equals(
                  request.getInviteCode())) {

            return ResponseEntity
                    .badRequest()
                    .body("招待コードが違います");
        }

        userService.register(
                request.getUsername(),
                request.getPassword());

        return ResponseEntity.ok(
                "登録成功");
    }
}