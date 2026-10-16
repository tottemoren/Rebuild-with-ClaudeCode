package com.example.demo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Duration;
import java.util.Base64;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultMatcher;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entity.User;
import com.jayway.jsonpath.JsonPath;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserService;

/**
 * ユーザー登録（/api/users/register）とログイン（/login）のテスト。
 *
 * 段階1で認証まわりを作り直す前に「今の動き」を記録した安全網。
 * 意図して仕様を変えたときは、このテストも合わせて書き換える（2026-10-16：メールアドレスの追加、重複時の409）。
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

	@Autowired
	private JwtDecoder jwtDecoder;

	// src/test/resources/config/application.properties のテスト専用の値
	private static final String INVITE_CODE = "test-invite-code";

	private static final String PASSWORD = "test-password-123";

	// DBに元から入っているユーザーとぶつからないよう、テストごとに違う名前を使う
	private static String uniqueUsername() {
		return "authtest_" + System.nanoTime();
	}

	private static String emailFor(String username) {
		return username + "@example.com";
	}

	private static String registerJson(String username, String email, String password, String inviteCode) {
		return """
				{"username":"%s","email":"%s","password":"%s","inviteCode":"%s"}
				""".formatted(username, email, password, inviteCode);
	}

	private void expectRegister(String json, ResultMatcher statusMatcher, String message)
			throws Exception {
		mockMvc.perform(post("/api/users/register")
				.contentType(MediaType.APPLICATION_JSON)
				.content(json))
				.andExpect(statusMatcher)
				.andExpect(content().string(message));
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
				.content(registerJson(username, "  " + emailFor(username).toUpperCase() + " ", PASSWORD, INVITE_CODE)))
				.andExpect(status().isOk())
				.andExpect(content().string("登録成功"));

		Optional<User> saved = userRepository.findByUsername(username);
		assertThat(saved).isPresent();
		// 前後の空白を取り除き、小文字にそろえて保存する（大文字小文字の違いで重複登録されないように）
		assertThat(saved.get().getEmail()).isEqualTo(emailFor(username));
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
				.content(registerJson(username, emailFor(username), PASSWORD, "wrong-code")))
				.andExpect(status().isBadRequest());

		assertThat(userRepository.findByUsername(username)).isEmpty();
	}

	@Test
	@DisplayName("同じユーザー名では登録できず、409とメッセージが返る")
	void register_withDuplicateUsername_returns409() throws Exception {
		String username = uniqueUsername();
		userService.register(username, emailFor(username), PASSWORD);

		expectRegister(registerJson(username, "other_" + emailFor(username), "another-password", INVITE_CODE),
				status().isConflict(), "このユーザー名は既に使われています");
	}

	@Test
	@DisplayName("同じメールアドレスでは登録できず、409とメッセージが返る（大文字小文字の違いも同じとみなす）")
	void register_withDuplicateEmail_returns409() throws Exception {
		String username = uniqueUsername();
		userService.register(username, emailFor(username), PASSWORD);

		expectRegister(registerJson(uniqueUsername(), emailFor(username).toUpperCase(), PASSWORD, INVITE_CODE),
				status().isConflict(), "このメールアドレスは既に登録されています");
	}

	@Test
	@DisplayName("メールアドレスの形式が正しくないと、400が返り、ユーザーは作られない")
	void register_withInvalidEmail_isRejected() throws Exception {
		String username = uniqueUsername();

		expectRegister(registerJson(username, "not-an-email", PASSWORD, INVITE_CODE),
				status().isBadRequest(), "メールアドレスの形式が正しくありません");

		assertThat(userRepository.findByUsername(username)).isEmpty();
	}

	@Test
	@DisplayName("ユーザー名かパスワードが空だと、400が返る")
	void register_withBlankUsername_isRejected() throws Exception {
		expectRegister(registerJson("   ", "blank@example.com", PASSWORD, INVITE_CODE),
				status().isBadRequest(), "ユーザー名とパスワードを入力してください");
	}

	@Test
	@DisplayName("メールアドレスが長すぎると、「既に使われています」ではなく、長すぎることを伝える400が返る")
	void register_withTooLongEmail_isRejected() throws Exception {
		String username = uniqueUsername();
		String tooLongEmail = "a".repeat(250) + "@example.com";

		expectRegister(registerJson(username, tooLongEmail, PASSWORD, INVITE_CODE),
				status().isBadRequest(), "ユーザー名とメールアドレスは255文字以内で入力してください");

		assertThat(userRepository.findByUsername(username)).isEmpty();
	}

	@Test
	@DisplayName("招待コードの前後に空白があっても、正しいコードなら登録できる")
	void register_withInviteCodeSurroundedBySpaces_succeeds() throws Exception {
		String username = uniqueUsername();

		expectRegister(registerJson(username, emailFor(username), PASSWORD, "  " + INVITE_CODE + " "),
				status().isOk(), "登録成功");
	}

	@Test
	@DisplayName("正しいパスワードでログインすると、ユーザー情報が返り、パスワードは含まれない")
	void login_withCorrectPassword_returnsUserWithoutPassword() throws Exception {
		String username = uniqueUsername();
		userService.register(username, emailFor(username), PASSWORD);

		mockMvc.perform(post("/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(loginJson(username, PASSWORD)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.username").value(username))
				.andExpect(jsonPath("$.id").isNumber())
				.andExpect(jsonPath("$.role").value("USER"))
				.andExpect(jsonPath("$.password").doesNotExist())
				.andExpect(jsonPath("$.email").doesNotExist());
	}

	@Test
	@DisplayName("ログインに成功すると合言葉（JWT）が返り、中身はユーザーID・ユーザー名・24時間の有効期限で、署名を確認できる")
	void login_returnsSignedTokenWithUserIdAndExpiry() throws Exception {
		String username = uniqueUsername();
		User user = userService.register(username, emailFor(username), PASSWORD);

		String body = mockMvc.perform(post("/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(loginJson(username, PASSWORD)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.token").isString())
				.andReturn().getResponse().getContentAsString();

		String token = JsonPath.read(body, "$.token");

		// 署名が正しくなければ、ここで例外になる
		Jwt jwt = jwtDecoder.decode(token);
		assertThat(jwt.getSubject()).isEqualTo(String.valueOf(user.getId()));
		assertThat(jwt.getClaimAsString("username")).isEqualTo(username);
		assertThat(jwt.getClaimAsString("iss")).isEqualTo("rebuild");
		assertThat(Duration.between(jwt.getIssuedAt(), jwt.getExpiresAt())).isEqualTo(Duration.ofHours(24));
	}

	@Test
	@DisplayName("今の段階では認証を必須にしていないので、壊れた合言葉が付いていても、合言葉なしでも、APIは今までどおり動く")
	void apis_doNotRequireTokenYet() throws Exception {
		mockMvc.perform(get("/api/memos")
				.header("Authorization", "Bearer broken.token.value"))
				.andExpect(status().isOk());

		mockMvc.perform(get("/api/memos"))
				.andExpect(status().isOk());
	}

	@Test
	@DisplayName("中身を書き換えた合言葉は、署名の確認で偽物として拒否される")
	void tamperedToken_isRejected() throws Exception {
		String username = uniqueUsername();
		userService.register(username, emailFor(username), PASSWORD);

		String body = mockMvc.perform(post("/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(loginJson(username, PASSWORD)))
				.andReturn().getResponse().getContentAsString();
		String token = JsonPath.read(body, "$.token");

		// 真ん中の部分（中身）を、別のユーザーIDのものに差し替える
		String[] parts = token.split("\\.");
		String forgedPayload = Base64.getUrlEncoder().withoutPadding()
				.encodeToString("{\"sub\":\"1\",\"iss\":\"rebuild\",\"exp\":9999999999}".getBytes());
		String forged = parts[0] + "." + forgedPayload + "." + parts[2];

		assertThrows(JwtException.class, () -> jwtDecoder.decode(forged));
	}

	@Test
	@DisplayName("ユーザー名の前後に空白を入れてログインしても、登録と同じようにそろえて照合する")
	void login_withUsernameSurroundedBySpaces_succeeds() throws Exception {
		String username = uniqueUsername();
		userService.register(username, emailFor(username), PASSWORD);

		mockMvc.perform(post("/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(loginJson(" " + username + "  ", PASSWORD)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.username").value(username));
	}

	@Test
	@DisplayName("パスワードが違うと、401が返る")
	void login_withWrongPassword_returns401() throws Exception {
		String username = uniqueUsername();
		userService.register(username, emailFor(username), PASSWORD);

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
