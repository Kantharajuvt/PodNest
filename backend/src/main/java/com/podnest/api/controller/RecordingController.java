package com.podnest.api.controller;

import com.podnest.api.model.Recording;
import com.podnest.api.service.RecordingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recordings")
@RequiredArgsConstructor
public class RecordingController {
    private final RecordingService recordingService;

    @GetMapping
    public ResponseEntity<List<Recording>> getUserRecordings() {
        return ResponseEntity.ok(recordingService.getUserRecordings());
    }

    @PostMapping
    public ResponseEntity<Recording> saveRecording(@RequestBody Map<String, Object> request) {
        if (request.get("studioId") == null) {
            throw new IllegalArgumentException("studioId is required");
        }
        if (request.get("title") == null) {
            throw new IllegalArgumentException("title is required");
        }

        Long studioId = Long.valueOf(request.get("studioId").toString());
        String title = request.get("title").toString();
        String duration = request.get("duration") != null ? request.get("duration").toString() : "00:00:00";
        String fileUrl = request.get("fileUrl") != null ? request.get("fileUrl").toString() : "";

        return ResponseEntity.ok(recordingService.saveRecording(studioId, title, duration, fileUrl));
    }
}
