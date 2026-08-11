package com.example.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.Data;

/**
 * 漫画作成ページ（CreateMangaPage）で配置した1枚のコマ画像を表す。
 * Dialogue と同じように、storyId で Story にひもづく。
 */
@Entity
@Table(name = "manga_panels")
@Data
public class MangaPanel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long storyId;

    // 配置したコマ画像のパス（例: /images/.../1.png）
    @Column(columnDefinition = "TEXT")
    private String imageSrc;

    // キャンバス内での位置・サイズ（px）
    private Double x;
    private Double y;
    private Double width;
    private Double height;

    // 重なり順（後から置いたものが上に来る）
    private Integer zIndex;

}
