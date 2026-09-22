package com.example.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.Data;

/**
 * フォルダに属するイラスト素材（アップロードされた画像）。
 * v1では簡易版としてローカルディスクに保存する（S3への移行は03-system-design参照）。
 */
@Entity
@Table(name = "materials")
@Data
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long folderId;

    private String fileName;

    // 公開URL（例: /uploads/materials/3/xxxx.png）
    @Column(columnDefinition = "TEXT")
    private String url;

}
