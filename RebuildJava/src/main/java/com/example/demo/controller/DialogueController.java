package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.Dialogue;
import com.example.demo.service.DialogueService;

@RestController
@RequestMapping("/dialogues")
@CrossOrigin
public class DialogueController {

    @Autowired
    private DialogueService dialogueService;

    @PostMapping
    public Dialogue createDialogue(
            @RequestBody Dialogue dialogue) {

        return dialogueService.saveDialogue(dialogue);

    }
    
    @GetMapping
    public List<Dialogue> getDialoguesByStoryId(
            @RequestParam Long storyId) {

        return dialogueService
                .getDialoguesByStoryId(
                        storyId);

    }
    

}