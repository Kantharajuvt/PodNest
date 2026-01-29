package com.podnest.api.controller;

import com.podnest.api.model.Studio;
import com.podnest.api.service.StudioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/studios")
@RequiredArgsConstructor
public class StudioController {
    private final StudioService studioService;
    private final com.podnest.api.service.EmailService emailService;

    @PostMapping
    public ResponseEntity<Studio> createStudio(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(studioService.createStudio(request.get("name")));
    }

    @GetMapping
    public ResponseEntity<List<Studio>> getAllStudios() {
        return ResponseEntity.ok(studioService.getAllStudios());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudio(@PathVariable Long id) {
        studioService.deleteStudio(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/invite/{code}")
    public ResponseEntity<Studio> getStudioByInvite(@PathVariable String code) {
        return ResponseEntity.ok(studioService.getByInviteCode(code));
    }

    @PostMapping("/{id}/invite-email")
    public ResponseEntity<Void> sendEmailInvite(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String email = request.get("email");
        Studio studio = studioService.getStudioById(id);
        String inviteUrl = "http://localhost:5173/join/" + studio.getInviteCode();
        emailService.sendStudioInvite(email, studio.getName(), inviteUrl);
        return ResponseEntity.ok().build();
    }
}
