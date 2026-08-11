package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.MangaPanel;
import com.example.demo.service.MangaPanelService;

/**
 * CreateMangaPage で配置したコマ画像（位置・サイズ）の保存/読み込みAPI。
 * StoryCreatePage で作った Story の storyId にひもづけて保存する。
 */
@RestController
@RequestMapping("/api/manga-panels")
@CrossOrigin
public class MangaPanelController {

    private final MangaPanelService mangaPanelService;

    public MangaPanelController(
            MangaPanelService mangaPanelService) {

        this.mangaPanelService = mangaPanelService;
    }

    @GetMapping
    public List<MangaPanel> getPanels(
            @RequestParam Long storyId) {

        return mangaPanelService.getPanelsByStoryId(storyId);
    }

    @PutMapping
    public List<MangaPanel> savePanels(
            @RequestParam Long storyId,
            @RequestBody List<MangaPanel> panels) {

        return mangaPanelService.replacePanels(storyId, panels);
    }

}
