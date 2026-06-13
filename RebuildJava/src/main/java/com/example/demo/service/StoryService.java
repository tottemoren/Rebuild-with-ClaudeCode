package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.entity.Story;
import com.example.demo.repository.StoryRepository;

@Service
public class StoryService {

    @Autowired
    private StoryRepository storyRepository;

    public Story saveStory(Story story) {

        return storyRepository.save(story);

    }
    
    public List<Story> getStories() {

        return storyRepository.findAll();

    }

}