package com.example.demo;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entity.Memo;
import com.example.demo.repository.MemoRepository;

/**
 * メモAPI（/api/memos）のテスト。
 *
 * - @SpringBootTest        : アプリ全体をテスト用に起動する（DBにも実際に接続する）
 * - @AutoConfigureMockMvc  : HTTPリクエストを疑似的に送る道具（MockMvc）を使えるようにする
 * - @Transactional         : テストごとにDBへの変更を自動で巻き戻し、データを残さない
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class MemoApiTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private MemoRepository memoRepository;

	// DBに元から入っているデータと区別するため、テスト専用の目印になる題名を使う
	private static final String TITLE = "メモAPIテスト用";

	private Memo saveMemo(String title, String content, String writingDirection) {
		Memo memo = new Memo();
		memo.setTitle(title);
		memo.setContent(content);
		memo.setWritingDirection(writingDirection);
		return memoRepository.save(memo);
	}

	@Test
	@DisplayName("メモを作成すると、一覧に表示される")
	void createMemo_appearsInList() throws Exception {
		String json = """
				{"title":"%s","content":"本文","writingDirection":"horizontal"}
				""".formatted(TITLE);

		mockMvc.perform(post("/api/memos")
				.contentType(MediaType.APPLICATION_JSON)
				.content(json))
				.andExpect(status().isOk());

		mockMvc.perform(get("/api/memos"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[?(@.title=='" + TITLE + "')].content").value("本文"))
				.andExpect(jsonPath("$[?(@.title=='" + TITLE + "')].writingDirection").value("horizontal"));
	}

	@Test
	@DisplayName("メモを更新すると、題名・本文・書字方向が書き換わる")
	void updateMemo_changesFields() throws Exception {
		Memo saved = saveMemo(TITLE, "更新前の本文", "horizontal");

		String json = """
				{"title":"%s（更新後）","content":"更新後の本文","writingDirection":"vertical"}
				""".formatted(TITLE);

		mockMvc.perform(put("/api/memos/" + saved.getId())
				.contentType(MediaType.APPLICATION_JSON)
				.content(json))
				.andExpect(status().isOk());

		mockMvc.perform(get("/api/memos"))
				.andExpect(jsonPath("$[?(@.title=='" + TITLE + "（更新後）')].content").value("更新後の本文"))
				.andExpect(jsonPath("$[?(@.title=='" + TITLE + "（更新後）')].writingDirection").value("vertical"))
				// 更新前の題名のメモは残っていない（新しく増えたのではなく、書き換わっている）
				.andExpect(jsonPath("$[?(@.title=='" + TITLE + "')]").isEmpty());
	}

	@Test
	@DisplayName("メモを削除すると、一覧から消える")
	void deleteMemo_removesFromList() throws Exception {
		Memo saved = saveMemo(TITLE, "削除される本文", "horizontal");

		mockMvc.perform(delete("/api/memos/" + saved.getId()))
				.andExpect(status().isOk());

		mockMvc.perform(get("/api/memos"))
				.andExpect(jsonPath("$[?(@.title=='" + TITLE + "')]").isEmpty());
	}
}
