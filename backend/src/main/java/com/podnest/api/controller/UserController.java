package com.podnest.api.controller;

import com.podnest.api.model.User;
import com.podnest.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        // Zero out password for security
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @PatchMapping("/me")
    public ResponseEntity<User> updateProfile(@RequestBody Map<String, Object> updates) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        if (updates.containsKey("fullName")) {
            user.setFullName((String) updates.get("fullName"));
        }

        if (updates.containsKey("phoneNumber")) {
            user.setPhoneNumber((String) updates.get("phoneNumber"));
        }

        if (updates.containsKey("notifyNewComments")) {
            user.setNotifyNewComments((Boolean) updates.get("notifyNewComments"));
        }

        if (updates.containsKey("notifyRecordingComplete")) {
            user.setNotifyRecordingComplete((Boolean) updates.get("notifyRecordingComplete"));
        }

        if (updates.containsKey("notifySpaceUsage")) {
            user.setNotifySpaceUsage((Boolean) updates.get("notifySpaceUsage"));
        }

        User saved = userRepository.save(user);
        saved.setPassword(null);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/favicon.ico")
    @ResponseBody
    public void returnNoFavicon() {
        // Just to prevent the 404/500 noise in logs
    }
}
