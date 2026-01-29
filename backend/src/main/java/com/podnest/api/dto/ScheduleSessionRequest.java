package com.podnest.api.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ScheduleSessionRequest {
    private String title;
    private String description;
    private Long studioId;
    private LocalDateTime startTime;
    private String expectedDuration;
    private String recordingType;

    // Settings
    private boolean autoStartStudio;
    private boolean autoStartRecording;
    private boolean waitingRoomEnabled;
    private boolean muteGuestsOnJoin;
    private boolean aiTranscriptionEnabled;

    private List<GuestRequest> guests;

    @Data
    public static class GuestRequest {
        private String email;
        private String name;
        private String role;
        private boolean canMic;
        private boolean canCamera;
        private boolean canScreenShare;
    }
}
