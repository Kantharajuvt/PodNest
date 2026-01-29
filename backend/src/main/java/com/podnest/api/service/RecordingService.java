package com.podnest.api.service;

import com.podnest.api.model.Recording;
import com.podnest.api.model.Studio;
import com.podnest.api.model.User;
import com.podnest.api.repository.RecordingRepository;
import com.podnest.api.repository.StudioRepository;
import com.podnest.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecordingService {
    private final RecordingRepository recordingRepository;
    private final StudioRepository studioRepository;
    private final UserRepository userRepository;

    public List<Recording> getUserRecordings() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        // Return all recordings from all studios owned by the user
        List<Studio> studios = studioRepository.findByOwner(user);
        return recordingRepository.findByStudioInOrderByCreatedAtDesc(studios);
    }

    public Recording saveRecording(Long studioId, String title, String duration, String fileUrl) {
        Studio studio = studioRepository.findById(studioId)
                .orElseThrow(() -> new RuntimeException("Studio not found"));

        Recording recording = Recording.builder()
                .title(title)
                .studio(studio)
                .duration(duration)
                .status("ready")
                .fileUrl(fileUrl)
                .build();

        return recordingRepository.save(recording);
    }
}
