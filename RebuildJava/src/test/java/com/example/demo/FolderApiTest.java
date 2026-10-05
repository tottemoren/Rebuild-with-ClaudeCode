package com.example.demo;

import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entity.Folder;
import com.example.demo.entity.Material;
import com.example.demo.repository.FolderRepository;
import com.example.demo.repository.MaterialRepository;

/**
 * イラスト素材フォルダ・素材のAPI（/api/folders, /api/materials）のテスト。
 *
 * 素材のアップロードは実際にディスクへファイルを書き込むため、
 * テスト中だけ保存先を一時フォルダに切り替え、実データ（RebuildJava/uploads）を汚さない。
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class FolderApiTest {

	// テストが終わると自動で削除される一時フォルダ
	@TempDir
	static Path uploadDir;

	// アプリの設定（file.materials-upload-dir）を、テスト中だけ一時フォルダに差し替える
	@DynamicPropertySource
	static void overrideUploadDir(DynamicPropertyRegistry registry) {
		registry.add("file.materials-upload-dir", () -> uploadDir.toString());
	}

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private FolderRepository folderRepository;

	@Autowired
	private MaterialRepository materialRepository;

	// DBに元から入っているデータと混ざらないよう、テスト専用のuserIdを使う
	private static final long TEST_USER_ID = 987654321L;
	private static final long OTHER_USER_ID = 987654322L;

	private Folder saveFolder(String name, long userId) {
		Folder folder = new Folder();
		folder.setName(name);
		folder.setUserId(userId);
		return folderRepository.save(folder);
	}

	@Test
	@DisplayName("フォルダを作成すると、そのユーザーの一覧にだけ表示される")
	void createFolder_appearsOnlyInOwnersList() throws Exception {
		String json = """
				{"name":"主人公","userId":%d}
				""".formatted(TEST_USER_ID);

		mockMvc.perform(post("/api/folders")
				.contentType(MediaType.APPLICATION_JSON)
				.content(json))
				.andExpect(status().isOk());

		mockMvc.perform(get("/api/folders").param("userId", String.valueOf(TEST_USER_ID)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].name").value("主人公"));

		// 別のユーザーの一覧には出ない
		mockMvc.perform(get("/api/folders").param("userId", String.valueOf(OTHER_USER_ID)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$").isEmpty());
	}

	@Test
	@DisplayName("空のフォルダは削除できる")
	void deleteEmptyFolder_succeeds() throws Exception {
		Folder folder = saveFolder("空のフォルダ", TEST_USER_ID);

		mockMvc.perform(delete("/api/folders/" + folder.getId()))
				.andExpect(status().isOk());

		mockMvc.perform(get("/api/folders").param("userId", String.valueOf(TEST_USER_ID)))
				.andExpect(jsonPath("$").isEmpty());
	}

	@Test
	@DisplayName("素材が残っているフォルダは削除できず、409が返る")
	void deleteFolderWithMaterials_returnsConflict() throws Exception {
		Folder folder = saveFolder("素材入りフォルダ", TEST_USER_ID);

		Material material = new Material();
		material.setFolderId(folder.getId());
		material.setFileName("a.png");
		material.setUrl("/uploads/materials/" + folder.getId() + "/a.png");
		materialRepository.save(material);

		mockMvc.perform(delete("/api/folders/" + folder.getId()))
				.andExpect(status().isConflict());

		// 削除されずに残っている
		mockMvc.perform(get("/api/folders").param("userId", String.valueOf(TEST_USER_ID)))
				.andExpect(jsonPath("$[0].name").value("素材入りフォルダ"));
	}

	@Test
	@DisplayName("素材をアップロードすると、ファイルが保存されて一覧に表示される")
	void uploadMaterial_savesFileAndRegisters() throws Exception {
		Folder folder = saveFolder("アップロード先", TEST_USER_ID);
		MockMultipartFile file = new MockMultipartFile(
				"file", "test.png", MediaType.IMAGE_PNG_VALUE, "dummy-image-bytes".getBytes());

		String responseBody = mockMvc.perform(multipart("/api/folders/" + folder.getId() + "/materials").file(file))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.fileName").value("test.png"))
				.andExpect(jsonPath("$.url").value(startsWith("/uploads/materials/" + folder.getId() + "/")))
				.andReturn().getResponse().getContentAsString();

		// 返ってきたURLの末尾（ランダムなファイル名）で、実際にファイルが保存されていることを確認する
		String storedName = responseBody.replaceAll(".*/", "").replaceAll("\"\\}.*", "");
		Path saved = uploadDir.resolve(String.valueOf(folder.getId())).resolve(storedName);
		assertTrue(Files.exists(saved), "アップロードしたファイルが保存先に存在すること: " + saved);

		mockMvc.perform(get("/api/folders/" + folder.getId() + "/materials"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].fileName").value("test.png"));
	}

	@Test
	@DisplayName("空のファイルをアップロードすると、400が返る")
	void uploadEmptyFile_returnsBadRequest() throws Exception {
		Folder folder = saveFolder("アップロード先", TEST_USER_ID);
		MockMultipartFile empty = new MockMultipartFile(
				"file", "empty.png", MediaType.IMAGE_PNG_VALUE, new byte[0]);

		mockMvc.perform(multipart("/api/folders/" + folder.getId() + "/materials").file(empty))
				.andExpect(status().isBadRequest());
	}

	@Test
	@DisplayName("素材を削除すると、フォルダ内の一覧から消える")
	void deleteMaterial_removesFromFolder() throws Exception {
		Folder folder = saveFolder("素材入りフォルダ", TEST_USER_ID);

		// 実在しないファイルを指すURLにしておく（実データのuploadsフォルダに触れないため）
		Material material = new Material();
		material.setFolderId(folder.getId());
		material.setFileName("b.png");
		material.setUrl("/uploads/materials/" + folder.getId() + "/not-exist-for-test.png");
		Material saved = materialRepository.save(material);

		mockMvc.perform(delete("/api/materials/" + saved.getId()))
				.andExpect(status().isOk());

		mockMvc.perform(get("/api/folders/" + folder.getId() + "/materials"))
				.andExpect(jsonPath("$").isEmpty());
	}
}
