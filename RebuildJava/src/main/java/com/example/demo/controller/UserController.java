package com.example.demo.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
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
@CrossOrigin(origins = {
		"http://localhost:5173", 
		"https://d7a89hxno1ipb.cloudfront.net",
	    "https://mangarebuild.com",
	    "https://www.mangarebuild.com"
})
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    // 公開リポジトリに書かないよう、環境変数 INVITE_CODE から受け取る。
    // 未設定のときは、誰でも登録できる状態になるより安全なため、登録自体を受け付けない。
    @Value("${app.invite-code:}")
    private String inviteCode;

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    // DBの列（VARCHAR(255)）に入りきらない値を、保存の前に「長すぎる」と伝えるための上限
    private static final int MAX_LENGTH = 255;

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

        // .env の書き方やコピーで紛れ込んだ前後の空白で、正しいコードが一致しなくならないようにする
        String expectedInviteCode = inviteCode.trim();

        if (expectedInviteCode.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("現在、新規登録を受け付けていません");
        }

        if (!expectedInviteCode.equals(trimToEmpty(request.getInviteCode()))) {
            return ResponseEntity
                    .badRequest()
                    .body("招待コードが違います");
        }

        String username = trimToEmpty(request.getUsername());
        String email = trimToEmpty(request.getEmail()).toLowerCase(Locale.ROOT);
        String password = Objects.toString(request.getPassword(), "");

        if (username.isEmpty() || password.isEmpty()) {
            return ResponseEntity
                    .badRequest()
                    .body("ユーザー名とパスワードを入力してください");
        }

        if (username.length() > MAX_LENGTH || email.length() > MAX_LENGTH) {
            return ResponseEntity
                    .badRequest()
                    .body("ユーザー名とメールアドレスは255文字以内で入力してください");
        }

        if (!EMAIL_PATTERN.matcher(email).matches()) {
            return ResponseEntity
                    .badRequest()
                    .body("メールアドレスの形式が正しくありません");
        }

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("このユーザー名は既に使われています");
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("このメールアドレスは既に登録されています");
        }

        try {
            userService.register(username, email, password);
        } catch (DataIntegrityViolationException e) {
            // 確認の直後に、ほぼ同時に同じ名前で登録された場合も重複として扱う
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("このユーザー名またはメールアドレスは既に使われています");
        }

        return ResponseEntity.ok(
                "登録成功");
    }

    private static String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
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