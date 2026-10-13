package com.example.demo;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

/**
 * アップロード画像（/uploads/**）の読み込み許可（CORS）のテスト。
 *
 * 「画像として保存」でキャンバスに描くには、フロントエンドの配信元からの読み込みが許可されている必要がある。
 * ブラウザが本番の読み込み前に送る「確認の問い合わせ」（OPTIONS）で確かめるため、
 * 実際の画像ファイル（uploads/ の実データ）には触れない。
 */
@SpringBootTest
@AutoConfigureMockMvc
class UploadsCorsTest {

	@Autowired
	private MockMvc mockMvc;

	private static final String IMAGE_PATH = "/uploads/materials/1/test.png";

	@Test
	@DisplayName("フロントエンドの配信元からの読み込みは許可される")
	void frontendOrigin_isAllowed() throws Exception {
		mockMvc.perform(options(IMAGE_PATH)
				.header("Origin", "http://localhost:5173")
				.header("Access-Control-Request-Method", "GET"))
				.andExpect(status().isOk())
				.andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
	}

	@Test
	@DisplayName("本番の配信元からの読み込みも許可される")
	void productionOrigin_isAllowed() throws Exception {
		mockMvc.perform(options(IMAGE_PATH)
				.header("Origin", "https://mangarebuild.com")
				.header("Access-Control-Request-Method", "GET"))
				.andExpect(status().isOk())
				.andExpect(header().string("Access-Control-Allow-Origin", "https://mangarebuild.com"));
	}

	@Test
	@DisplayName("登録していないサイトからの読み込みは許可されない")
	void unknownOrigin_isRejected() throws Exception {
		mockMvc.perform(options(IMAGE_PATH)
				.header("Origin", "https://example.com")
				.header("Access-Control-Request-Method", "GET"))
				.andExpect(status().isForbidden())
				.andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
	}

	@Test
	@DisplayName("読み込み（GET）以外の操作は許可されない")
	void otherMethods_areRejected() throws Exception {
		mockMvc.perform(options(IMAGE_PATH)
				.header("Origin", "http://localhost:5173")
				.header("Access-Control-Request-Method", "DELETE"))
				.andExpect(status().isForbidden());
	}
}
