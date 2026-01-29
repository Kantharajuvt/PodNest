package com.podnest.api.controller;

import com.podnest.api.dto.ScheduleSessionRequest;
import com.podnest.api.model.ScheduledSession;
import com.podnest.api.service.ScheduledSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedule")
@RequiredArgsConstructor
public class ScheduledSessionController {
    private final ScheduledSessionService sessionService;

    @GetMapping
    public ResponseEntity<List<ScheduledSession>> getUserSessions() {
        return ResponseEntity.ok(sessionService.getUserScheduledSessions());
    }

    @PostMapping
    public ResponseEntity<ScheduledSession> scheduleSession(@RequestBody ScheduleSessionRequest request) {
        return ResponseEntity.ok(sessionService.scheduleSession(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        sessionService.deleteSession(id);
        return ResponseEntity.ok().build();
    }
}
