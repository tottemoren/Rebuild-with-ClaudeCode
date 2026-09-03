package com.example.demo.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.entity.Folder;
import com.example.demo.entity.Material;
import com.example.demo.repository.FolderRepository;
import com.example.demo.repository.MaterialRepository;

/**
 * イラスト素材フォルダ・素材のAPI（v1簡易版）。
 * 素材の実体はローカルディスクに保存する（S3への移行は03-system-design参照）。
 * JWT認証は未実装のため、現状は他のAPI同様リクエストで受け取ったuserIdをそのまま使用する。
 */
@RestController
@RequestMapping("/api/folders")
@CrossOrigin
public class FolderController {

    private final FolderRepository folderRepository;
    private final MaterialRepository materialRepository;

    @Value("${file.materials-upload-dir}")
    private String materialsUploadDir;

    public FolderController(
            FolderRepository folderRepository,
            MaterialRepository materialRepository) {

        this.folderRepository = folderRepository;
        this.materialRepository = materialRepository;
    }

    @GetMapping
    public List<Folder> getFolders(
            @RequestParam Long userId) {

        return folderRepository.findByUserId(userId);
    }

    @PostMapping
    public Folder createFolder(
            @RequestBody Folder folder) {

        return folderRepository.save(folder);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFolder(
            @PathVariable Long id) {

        List<Material> materials =
                materialRepository.findByFolderId(id);

        if (!materials.isEmpty()) {
            return ResponseEntity
                    .status(409)
                    .body("フォルダ内に素材が残っているため削除できません");
        }

        folderRepository.deleteById(id);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{folderId}/materials")
    public List<Material> getMaterials(
            @PathVariable Long folderId) {

        return materialRepository.findByFolderId(folderId);
    }

    /**
     * 素材（イラスト画像）のアップロード。
     * multipart/form-data で "file" というキーに画像を入れて送信する。
     */
    @PostMapping("/{folderId}/materials")
    public ResponseEntity<?> uploadMaterial(
            @PathVariable Long folderId,
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity
                    .badRequest()
                    .body("ファイルが選択されていません");
        }

        String originalName =
                file.getOriginalFilename() == null
                        ? ""
                        : file.getOriginalFilename();

        String extension = "";
        int dotIndex = originalName.lastIndexOf('.');

        if (dotIndex >= 0) {
            extension = originalName.substring(dotIndex);
        }

        String storedFileName =
                UUID.randomUUID() + extension;

        try {
            Path uploadPath =
                    Paths.get(materialsUploadDir, String.valueOf(folderId));

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path targetPath = uploadPath.resolve(storedFileName);

            Files.copy(
                    file.getInputStream(),
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING);

        } catch (IOException e) {

            return ResponseEntity
                    .internalServerError()
                    .body("画像の保存に失敗しました: " + e.getMessage());
        }

        String publicUrl =
                "/uploads/materials/" + folderId + "/" + storedFileName;

        Material material = new Material();
        material.setFolderId(folderId);
        material.setFileName(originalName);
        material.setUrl(publicUrl);

        Material saved = materialRepository.save(material);

        return ResponseEntity.ok(saved);
    }
}
