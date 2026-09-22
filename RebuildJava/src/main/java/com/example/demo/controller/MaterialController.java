package com.example.demo.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.repository.MaterialRepository;

@RestController
@RequestMapping("/api/materials")
@CrossOrigin
public class MaterialController {

    private final MaterialRepository materialRepository;

    public MaterialController(
            MaterialRepository materialRepository) {

        this.materialRepository = materialRepository;
    }

    @DeleteMapping("/{id}")
    public void deleteMaterial(
            @PathVariable Long id) {

        materialRepository.findById(id)
                .ifPresent(material -> {

                    try {
                        // url は "/uploads/materials/xxx/yyy.png" 形式
                        String relativePath =
                                material.getUrl()
                                        .replaceFirst("^/uploads/", "");

                        Files.deleteIfExists(Paths.get("uploads", relativePath));

                    } catch (IOException ignored) {
                        // ファイルが既に無い場合等は無視し、DBレコードの削除は続行する
                    }

                    materialRepository.deleteById(id);
                });
    }
}
