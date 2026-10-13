package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entity.MangaPanel;
import com.example.demo.repository.MangaPanelRepository;

@Service
public class MangaPanelService {

    private final MangaPanelRepository mangaPanelRepository;

    public MangaPanelService(
            MangaPanelRepository mangaPanelRepository) {

        this.mangaPanelRepository = mangaPanelRepository;
    }

    public List<MangaPanel> getPanelsByStoryId(
            Long storyId) {

        return mangaPanelRepository
                .findByStoryIdOrderedByZIndex(storyId);
    }

    /**
     * 指定した storyId の既存コマ配置をすべて置き換えて保存する。
     * 「編集して保存」を単純化するため、既存分を削除してから新しい配置を保存し直す方式にしている。
     */
    @Transactional
    public List<MangaPanel> replacePanels(
            Long storyId,
            List<MangaPanel> panels) {

        mangaPanelRepository.deleteByStoryId(storyId);

        for (MangaPanel panel : panels) {
            panel.setId(null);
            panel.setStoryId(storyId);
        }

        return mangaPanelRepository.saveAll(panels);
    }

}
