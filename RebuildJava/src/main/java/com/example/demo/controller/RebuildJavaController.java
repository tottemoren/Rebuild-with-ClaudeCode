package com.example.demo.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.entity.Memo;
import com.example.demo.entity.User;
import com.example.demo.repository.MemoRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.TokenService;

@RestController
@CrossOrigin(origins = {
		"http://localhost:5173", 
		"https://d7a89hxno1ipb.cloudfront.net",
		"https://mangarebuild.com",
	    "https://www.mangarebuild.com"
})
public class RebuildJavaController {

    @GetMapping("/")
    public String home() {

        return "Spring Boot Running";
    }
    
	private final MemoRepository memoRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public RebuildJavaController(
            MemoRepository memoRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            TokenService tokenService
    ) {

        this.memoRepository = memoRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request
    ) {

        // 登録時はユーザー名の前後の空白を取り除いて保存するため、ログインでも同じようにそろえる
        String username = request.getUsername() == null ? "" : request.getUsername().trim();

        Optional<User> userOptional =
                userRepository.findByUsername(
                        username);

        if (userOptional.isPresent()) {

            User user = userOptional.get();

            // ハッシュ化されたパスワードと、入力された生パスワードを照合する
            if (
                passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword())
            ) {

                return ResponseEntity.ok(
                        LoginResponse.of(user, tokenService.issue(user)));
            }
        }

        return ResponseEntity.status(401)
                .body("fail");
    }
      

	@GetMapping("/api/memos")
	public List<Memo> getMemos() {
		return memoRepository.findAll();
	}
	

	@PostMapping("/api/memos")
	public void addMemo(@RequestBody Memo memo) {
		memoRepository.save(memo);
	}
	
	@DeleteMapping("/api/memos/{id}")
	public void deleteMemo(@PathVariable Long id) {
		memoRepository.deleteById(id);
	}
	
	@PutMapping("api/memos/{id}")
	public void updateMemo(
			@PathVariable Long id,
			@RequestBody Memo memo) {
		Memo updateMemo = memoRepository.findById(id).orElseThrow();

		updateMemo.setTitle(memo.getTitle());
		updateMemo.setContent(memo.getContent());
		updateMemo.setWritingDirection(memo.getWritingDirection());

		memoRepository.save(updateMemo);
	}
	
}