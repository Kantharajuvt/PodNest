package com.podnest.api.service;

import com.podnest.api.dto.ScheduleSessionRequest;
import com.podnest.api.model.*;
import com.podnest.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduledSessionService {
    private final ScheduledSessionRepository sessionRepository;
    private final StudioRepository studioRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public List<ScheduledSession> getUserScheduledSessions() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        List<Studio> studios = studioRepository.findByOwner(user);
        return sessionRepository.findByStudioInOrderByStartTimeAsc(studios);
    }

    @Transactional
    public ScheduledSession scheduleSession(ScheduleSessionRequest request) {
        System.out.println("Processing schedule request: " + request);

        if (request.getStudioId() == null) {
            throw new RuntimeException("Studio ID is required");
        }

        Studio studio = studioRepository.findById(request.getStudioId())
                .orElseThrow(() -> new RuntimeException("Studio not found with ID: " + request.getStudioId()));

        ScheduledSession session = ScheduledSession.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .studio(studio)
                .startTime(request.getStartTime())
                .expectedDuration(request.getExpectedDuration())
                .recordingType(request.getRecordingType())
                .autoStartStudio(request.isAutoStartStudio())
                .autoStartRecording(request.isAutoStartRecording())
                .waitingRoomEnabled(request.isWaitingRoomEnabled())
                .muteGuestsOnJoin(request.isMuteGuestsOnJoin())
                .aiTranscriptionEnabled(request.isAiTranscriptionEnabled())
                .status("UPCOMING")
                .build();

        if (request.getGuests() != null) {
            List<SessionGuest> guests = request.getGuests().stream()
                    .map(g -> SessionGuest.builder()
                            .session(session)
                            .email(g.getEmail())
                            .name(g.getName())
                            .role(g.getRole())
                            .canMic(g.isCanMic())
                            .canCamera(g.isCanCamera())
                            .canScreenShare(g.isCanScreenShare())
                            .invitationStatus("PENDING")
                            .build())
                    .collect(Collectors.toList());
            session.setGuests(guests);
        }

        ScheduledSession savedSession = sessionRepository.save(session);
        System.out.println("Session saved with ID: " + savedSession.getId());

        // Send invitations to guests
        if (request.getGuests() != null && session.getStartTime() != null) {
            String inviteUrl = "http://localhost:5173/join/" + studio.getInviteCode();
            String formattedTime = session.getStartTime().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm"));

            request.getGuests().forEach(guest -> {
                try {
                    emailService.sendSessionInvite(guest.getEmail(), session.getTitle(), formattedTime, inviteUrl);
                } catch (Exception e) {
                    System.err.println("Failed to send invite to " + guest.getEmail() + ": " + e.getMessage());
                }
            });
        }

        return savedSession;
    }

    @Transactional
    public void deleteSession(Long id) {
        sessionRepository.deleteById(id);
    }
}
