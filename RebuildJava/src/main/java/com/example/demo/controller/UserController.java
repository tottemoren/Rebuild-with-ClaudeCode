package com.example.demo.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.dto.RegisterRequest;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public UserController(
            UserService userService,
            UserRepository userRepository) {

        this.userService = userService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(

            @RequestBody
            RegisterRequest request) {

        if (!"Rebuild2026"
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

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(
            @PathVariable Long id) {

        Optional<User> user =
                userRepository.findById(id);

        return user
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build());
    }

    /**
     * プロフィール画像のアップロード。
     * multipart/form-data で "file" というキーに画像を入れて送信する。
     * 成功すると profileImageUrl が更新された最新のユーザー情報を返す。
     */
    @PostMapping("/{id}/profile-image")
    public ResponseEntity<?> uploadProfileImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity
                    .badRequest()
                    .body("ファイルが選択されていません");
        }

        String originalName =
                file.getOriginalFilename() == null
                        ? ""
                        : file.getOriginalFilename();

        String extension = "";
        int dotIndex = originalName.lastIndexOf('.');

        if (dotIndex >= 0) {
            extension = originalName.substring(dotIndex);
        }

        String storedFileName =
                "user-" + id + "-" + UUID.randomUUID() + extension;

        try {
            Path uploadPath = Paths.get(uploadDir);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path targetPath = uploadPath.resolve(storedFileName);

            Files.copy(
                    file.getInputStream(),
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING);

        } catch (IOException e) {

            return ResponseEntity
                    .internalServerError()
                    .body("画像の保存に失敗しました: " + e.getMessage());
        }

        String publicUrl =
                "/uploads/profile-images/" + storedFileName;

        User updatedUser =
                userService.updateProfileImage(id, publicUrl);

        return ResponseEntity.ok(updatedUser);
    }
}