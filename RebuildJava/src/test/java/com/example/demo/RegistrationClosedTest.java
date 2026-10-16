package com.example.demo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.repository.UserRepository;

/**
 * 招待コード（環境変数 INVITE_CODE）が設定されていないときの登録のテスト。
 * 設定し忘れても「誰でも登録できる」状態にならないことを確かめる。
 */
@SpringBootTest(properties = "app.invite-code=")
@AutoConfigureMockMvc
@Transactional
class RegistrationClosedTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private UserRepository userRepository;

	@Test
	@DisplayName("招待コードが未設定のときは、どんなコードを送っても403が返り、ユーザーは作られない")
	void register_whenInviteCodeNotConfigured_isClosed() throws Exception {
		String username = "closedtest_" + System.nanoTime();
		String json = """
				{"username":"%s","email":"%s@example.com","password":"pw","inviteCode":""}
				""".formatted(username, username);

		mockMvc.perform(post("/api/users/register")
				.contentType(MediaType.APPLICATION_JSON)
				.content(json))
				.andExpect(status().isForbidden())
				.andExpect(content().string("現在、新規登録を受け付けていません"));

		assertThat(userRepository.findByUsername(username)).isEmpty();
	}
}
