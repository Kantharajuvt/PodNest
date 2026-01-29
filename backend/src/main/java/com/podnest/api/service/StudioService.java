package com.podnest.api.service;

import com.podnest.api.model.Studio;
import com.podnest.api.model.User;
import com.podnest.api.repository.StudioRepository;
import com.podnest.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudioService {
    private final StudioRepository studioRepository;
    private final UserRepository userRepository;

    public List<Studio> getUserStudios() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return studioRepository.findByOwner(user);
    }

    public List<Studio> getAllStudios() {
        return getUserStudios();
    }

    public Studio getStudioById(Long id) {
        return studioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Studio not found"));
    }

    public Studio createStudio(String name) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        Studio studio = Studio.builder()
                .name(name)
                .owner(user)
                .build();
        return studioRepository.save(studio);
    }

    public void deleteStudio(Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        Studio studio = studioRepository.findById(id).orElseThrow();

        if (!studio.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to delete this studio");
        }

        studioRepository.delete(studio);
    }

    public Studio getByInviteCode(String inviteCode) {
        return studioRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new RuntimeException("Studio not found"));
    }
}
