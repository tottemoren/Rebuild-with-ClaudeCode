package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.MangaPanel;

@Repository
public interface MangaPanelRepository
        extends JpaRepository<MangaPanel, Long> {

    // メソッド名から検索を自動生成させると「OrderByZIndex」が属性名 "ZIndex" と解釈され、
    // 実際の属性名 "zIndex" と一致せずエラーになるため、検索内容を明示している
    @Query("SELECT p FROM MangaPanel p WHERE p.storyId = :storyId ORDER BY p.zIndex ASC")
    List<MangaPanel> findByStoryIdOrderedByZIndex(
            @Param("storyId") Long storyId);

    void deleteByStoryId(
            Long storyId);

}
