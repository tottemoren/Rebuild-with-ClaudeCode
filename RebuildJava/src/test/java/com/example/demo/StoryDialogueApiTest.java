package com.example.demo;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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

import com.example.demo.entity.Story;
import com.example.demo.repository.StoryRepository;

/**
 * ストーリー（/stories）とセリフ（/dialogues）のテスト。
 *
 * 段階1で「データの持ち主の確認」を入れる前の「今の動き」を記録する。
 * 他のユーザーのストーリーも一覧に出る動きは、段階1で「拒否する」形に変え、このテストも書き換える。
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class StoryDialogueApiTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private StoryRepository storyRepository;

	// DBの元データと混ざらないよう、テスト専用の題名とユーザーIDを使う
	private static final String TITLE = "ストーリーAPIテスト用";
	private static final long USER_ID = 987654321L;
	private static final long OTHER_USER_ID = 987654322L;

	private Story saveStory(String title, long userId) {
		Story story = new Story();
		story.setTitle(title);
		story.setSummary("あらすじ");
		story.setGenre("学園 青春");
		story.setUserId(userId);
		return storyRepository.save(story);
	}

	private void postDialogue(long storyId, int orderNo, String talkerName, String line) throws Exception {
		String json = """
				{"storyId":%d,"orderNo":%d,"talkerName":"%s","line":"%s"}
				""".formatted(storyId, orderNo, talkerName, line);

		mockMvc.perform(post("/dialogues")
				.contentType(MediaType.APPLICATION_JSON)
				.content(json))
				.andExpect(status().isOk());
	}

	@Test
	@DisplayName("ストーリーを作成すると、IDが付いて返り、一覧に表示される")
	void createStory_appearsInList() throws Exception {
		String json = """
				{"title":"%s","summary":"あらすじ","genre":"学園 青春","userId":%d}
				""".formatted(TITLE, USER_ID);

		mockMvc.perform(post("/stories")
				.contentType(MediaType.APPLICATION_JSON)
				.content(json))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").isNumber())
				.andExpect(jsonPath("$.title").value(TITLE));

		mockMvc.perform(get("/stories"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[?(@.title=='" + TITLE + "')].summary").value("あらすじ"))
				.andExpect(jsonPath("$[?(@.title=='" + TITLE + "')].userId").value((int) USER_ID));
	}

	@Test
	@DisplayName("今の動き：ストーリーの一覧には、他のユーザーのストーリーも含まれる（段階1で直す）")
	void listStories_currentlyIncludesOtherUsers() throws Exception {
		saveStory(TITLE + "（自分）", USER_ID);
		saveStory(TITLE + "（他人）", OTHER_USER_ID);

		mockMvc.perform(get("/stories"))
				.andExpect(jsonPath("$[?(@.title=='" + TITLE + "（自分）')]").isNotEmpty())
				.andExpect(jsonPath("$[?(@.title=='" + TITLE + "（他人）')]").isNotEmpty());
	}

	@Test
	@DisplayName("セリフは、追加した順ではなく番号（orderNo）の順に返る")
	void listDialogues_returnsInOrderNo() throws Exception {
		Story story = saveStory(TITLE, USER_ID);

		postDialogue(story.getId(), 2, "ユウ", "……うん");
		postDialogue(story.getId(), 1, "ミカ", "図書室で、また明日");

		mockMvc.perform(get("/dialogues").param("storyId", String.valueOf(story.getId())))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(2))
				.andExpect(jsonPath("$[0].talkerName").value("ミカ"))
				.andExpect(jsonPath("$[0].line").value("図書室で、また明日"))
				.andExpect(jsonPath("$[1].talkerName").value("ユウ"));
	}

	@Test
	@DisplayName("セリフの一覧には、指定したストーリーのセリフだけが含まれる")
	void listDialogues_onlyForGivenStory() throws Exception {
		Story story = saveStory(TITLE, USER_ID);
		Story otherStory = saveStory(TITLE + "（別）", USER_ID);

		postDialogue(story.getId(), 1, "ミカ", "このストーリーのセリフ");
		postDialogue(otherStory.getId(), 1, "ユウ", "別のストーリーのセリフ");

		mockMvc.perform(get("/dialogues").param("storyId", String.valueOf(story.getId())))
				.andExpect(jsonPath("$.length()").value(1))
				.andExpect(jsonPath("$[0].line").value("このストーリーのセリフ"));
	}
}
