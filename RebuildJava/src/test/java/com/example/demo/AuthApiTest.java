package com.example.demo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserService;

/**
 * ユーザー登録（/api/users/register）とログイン（/login）のテスト。
 *
 * 段階1で認証（JWT）を入れる前の「今の動き」を記録しておき、
 * 作り直しで意図せず壊していないかを確かめる安全網にする。
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthApiTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private UserService userService;

	@Autowired
	private PasswordEncoder passwordEncoder;

	private static final String INVITE_CODE = "Rebuild2026";

	private static final String PASSWORD = "test-password-123";

	// DBに元から入っているユーザーとぶつからないよう、テストごとに違う名前を使う
	private static String uniqueUsername() {
		return "authtest_" + System.nanoTime();
	}

	private static String registerJson(String username, String password, String inviteCode) {
		return """
				{"username":"%s","password":"%s","inviteCode":"%s"}
				""".formatted(username, password, inviteCode);
	}

	private static String loginJson(String username, String password) {
		return """
				{"username":"%s","password":"%s"}
				""".formatted(username, password);
	}

	@Test
	@DisplayName("正しい招待コードで登録すると、パスワードはハッシュ化されて保存される")
	void register_withValidInviteCode_savesHashedPassword() throws Exception {
		String username = uniqueUsername();

		mockMvc.perform(post("/api/users/register")
				.contentType(MediaType.APPLICATION_JSON)
				.content(registerJson(username, PASSWORD, INVITE_CODE)))
				.andExpect(status().isOk())
				.andExpect(content().string("登録成功"));

		Optional<User> saved = userRepository.findByUsername(username);
		assertThat(saved).isPresent();
		assertThat(saved.get().getRole()).isEqualTo("USER");
		assertThat(saved.get().getPassword()).isNotEqualTo(PASSWORD);
		assertThat(passwordEncoder.matches(PASSWORD, saved.get().getPassword())).isTrue();
	}

	@Test
	@DisplayName("招待コードが違うと、400が返り、ユーザーは作られない")
	void register_withWrongInviteCode_isRejected() throws Exception {
		String username = uniqueUsername();

		mockMvc.perform(post("/api/users/register")
				.contentType(MediaType.APPLICATION_JSON)
				.content(registerJson(username, PASSWORD, "wrong-code")))
				.andExpect(status().isBadRequest());

		assertThat(userRepository.findByUsername(username)).isEmpty();
	}

	@Test
	@DisplayName("同じユーザー名では2人目を登録できない（今はエラーの扱いが無く、サーバー内部のエラーになる）")
	void register_withDuplicateUsername_fails() throws Exception {
		String username = uniqueUsername();
		userService.register(username, PASSWORD);

		// DBの「ユーザー名は重複不可」の制約で保存に失敗する。
		// APIがこれを扱っていないため、例外がそのまま外に出る（409を返す形にするのは今後の課題）
		assertThrows(Exception.class, () -> mockMvc.perform(post("/api/users/register")
				.contentType(MediaType.APPLICATION_JSON)
				.content(registerJson(username, "another-password", INVITE_CODE))));
	}

	@Test
	@DisplayName("正しいパスワードでログインすると、ユーザー情報が返り、パスワードは含まれない")
	void login_withCorrectPassword_returnsUserWithoutPassword() throws Exception {
		String username = uniqueUsername();
		userService.register(username, PASSWORD);

		mockMvc.perform(post("/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(loginJson(username, PASSWORD)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.username").value(username))
				.andExpect(jsonPath("$.id").isNumber())
				.andExpect(jsonPath("$.password").doesNotExist());
	}

	@Test
	@DisplayName("パスワードが違うと、401が返る")
	void login_withWrongPassword_returns401() throws Exception {
		String username = uniqueUsername();
		userService.register(username, PASSWORD);

		mockMvc.perform(post("/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(loginJson(username, "wrong-password")))
				.andExpect(status().isUnauthorized());
	}

	@Test
	@DisplayName("存在しないユーザー名だと、401が返る")
	void login_withUnknownUser_returns401() throws Exception {
		mockMvc.perform(post("/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(loginJson(uniqueUsername(), PASSWORD)))
				.andExpect(status().isUnauthorized());
	}
}
