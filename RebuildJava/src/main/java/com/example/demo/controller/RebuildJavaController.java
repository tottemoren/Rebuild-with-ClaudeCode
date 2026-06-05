package com.example.demo.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.LoginRequest;
import com.example.demo.entity.Memo;
import com.example.demo.entity.User;
import com.example.demo.repository.MemoRepository;
import com.example.demo.repository.UserRepository;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class RebuildJavaController {

    @GetMapping("/")
    public String home() {

        return "Spring Boot Running";
    }
    
	private final MemoRepository memoRepository;
    private final UserRepository userRepository;

    public RebuildJavaController(
            MemoRepository memoRepository,
            UserRepository userRepository
    ) {

        this.memoRepository = memoRepository;
        this.userRepository = userRepository;
    }
    

    @PostMapping("/login")
    public ResponseEntity<String> login(
            @RequestBody LoginRequest request
    ) {

        Optional<User> userOptional =
                userRepository.findByUsername(
                        request.getUsername());

        if (userOptional.isPresent()) {

            User user = userOptional.get();

            if (
                user.getPassword().equals(
                        request.getPassword())
            ) {

                return ResponseEntity.ok(
                        "success");
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
		
		updateMemo.setText(memo.getText());
		
		memoRepository.save(updateMemo);
	}
	
}