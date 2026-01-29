package com.podnest.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "scheduled_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduledSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    @ManyToOne
    @JoinColumn(name = "studio_id", nullable = false)
    private Studio studio;

    @Column(nullable = false)
    private LocalDateTime startTime;

    private String expectedDuration; // e.g., "60 min"

    @Column(nullable = false)
    private String recordingType; // AUDIO, VIDEO, LIVE

    // Advanced Settings
    private boolean autoStartStudio;
    private boolean autoStartRecording;
    private boolean waitingRoomEnabled;
    private boolean muteGuestsOnJoin;
    private boolean aiTranscriptionEnabled;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SessionGuest> guests = new ArrayList<>();

    @Column(nullable = false)
    private String status; // UPCOMING, LIVE, COMPLETED, CANCELLED

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null)
            status = "UPCOMING";
    }
}
