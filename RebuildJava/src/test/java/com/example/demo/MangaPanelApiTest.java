package com.example.demo;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.example.demo.entity.MangaPanel;
import com.example.demo.repository.MangaPanelRepository;

/**
 * コマ配置API（/api/manga-panels）のテスト。
 *
 * 他のAPIテストと違い @Transactional を付けていない。
 * 保存処理（既存の配置を削除してから保存し直す）が、テスト側のトランザクションに頼らず
 * 単独で動くことまで確かめるため。代わりに、テスト専用のストーリーIDを使い、終わったら削除する。
 */
@SpringBootTest
@AutoConfigureMockMvc
class MangaPanelApiTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private MangaPanelRepository mangaPanelRepository;

	// DBに元から入っているデータと混ざらないよう、実際には使われない大きな番号をテスト専用にする
	private static final long STORY_ID = 990001L;
	private static final long OTHER_STORY_ID = 990002L;

	@AfterEach
	void cleanUp() {
		List<MangaPanel> testPanels = mangaPanelRepository.findAll().stream()
				.filter(panel -> panel.getStoryId() != null)
				.filter(panel -> panel.getStoryId() == STORY_ID || panel.getStoryId() == OTHER_STORY_ID)
				.toList();
		mangaPanelRepository.deleteAll(testPanels);
	}

	private void savePanels(long storyId, String json) throws Exception {
		mockMvc.perform(put("/api/manga-panels").param("storyId", String.valueOf(storyId))
				.contentType(MediaType.APPLICATION_JSON)
				.content(json))
				.andExpect(status().isOk());
	}

	@Test
	@DisplayName("保存した配置を読み込むと、画像・位置・大きさ・重なり順が戻る")
	void savedPanels_canBeLoaded() throws Exception {
		savePanels(STORY_ID, """
				[{"imageSrc":"/uploads/materials/1/a.png","x":10.5,"y":20,"width":200,"height":150,"zIndex":3}]
				""");

		mockMvc.perform(get("/api/manga-panels").param("storyId", String.valueOf(STORY_ID)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(1))
				.andExpect(jsonPath("$[0].imageSrc").value("/uploads/materials/1/a.png"))
				.andExpect(jsonPath("$[0].x").value(10.5))
				.andExpect(jsonPath("$[0].y").value(20.0))
				.andExpect(jsonPath("$[0].width").value(200.0))
				.andExpect(jsonPath("$[0].height").value(150.0))
				.andExpect(jsonPath("$[0].zIndex").value(3));
	}

	@Test
	@DisplayName("読み込んだ配置は、重なり順の小さい順に並ぶ")
	void loadedPanels_areOrderedByZIndex() throws Exception {
		savePanels(STORY_ID, """
				[{"imageSrc":"/top.png","x":0,"y":0,"width":10,"height":10,"zIndex":5},
				 {"imageSrc":"/bottom.png","x":0,"y":0,"width":10,"height":10,"zIndex":1}]
				""");

		mockMvc.perform(get("/api/manga-panels").param("storyId", String.valueOf(STORY_ID)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].imageSrc").value("/bottom.png"))
				.andExpect(jsonPath("$[1].imageSrc").value("/top.png"));
	}

	@Test
	@DisplayName("もう一度保存すると、前の配置は新しい配置に置き換わる")
	void savingAgain_replacesPreviousPanels() throws Exception {
		savePanels(STORY_ID, """
				[{"imageSrc":"/old-1.png","x":0,"y":0,"width":10,"height":10,"zIndex":1},
				 {"imageSrc":"/old-2.png","x":0,"y":0,"width":10,"height":10,"zIndex":2}]
				""");
		savePanels(STORY_ID, """
				[{"imageSrc":"/new.png","x":0,"y":0,"width":10,"height":10,"zIndex":1}]
				""");

		mockMvc.perform(get("/api/manga-panels").param("storyId", String.valueOf(STORY_ID)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(1))
				.andExpect(jsonPath("$[0].imageSrc").value("/new.png"));
	}

	@Test
	@DisplayName("別のストーリーの配置は混ざらない")
	void panelsOfOtherStories_areNotIncluded() throws Exception {
		savePanels(STORY_ID, """
				[{"imageSrc":"/mine.png","x":0,"y":0,"width":10,"height":10,"zIndex":1}]
				""");
		savePanels(OTHER_STORY_ID, """
				[{"imageSrc":"/other.png","x":0,"y":0,"width":10,"height":10,"zIndex":1}]
				""");

		mockMvc.perform(get("/api/manga-panels").param("storyId", String.valueOf(STORY_ID)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(1))
				.andExpect(jsonPath("$[0].imageSrc").value("/mine.png"));
	}
}
