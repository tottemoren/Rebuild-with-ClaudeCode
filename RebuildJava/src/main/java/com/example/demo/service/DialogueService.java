package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.entity.Dialogue;
import com.example.demo.repository.DialogueRepository;


@Service
public class DialogueService {

    @Autowired
    private DialogueRepository dialogueRepository;

    public Dialogue saveDialogue(
            Dialogue dialogue) {

        return dialogueRepository.save(dialogue);

    }
    
    public List<Dialogue> getDialoguesByStoryId(
            Long storyId) {

        return dialogueRepository
                .findByStoryIdOrderByOrderNo(
                        storyId);

    }

}