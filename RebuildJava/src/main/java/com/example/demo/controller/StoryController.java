package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.Story;
import com.example.demo.service.StoryService;

@RestController
@RequestMapping("/stories")
@CrossOrigin
public class StoryController {

    @Autowired
    private StoryService storyService;

    @PostMapping
    public Story createStory(
            @RequestBody Story story) {

        return storyService.saveStory(story);

    }
    
    @GetMapping
    public List<Story> getStories() {

        return storyService.getStories();

    }

}