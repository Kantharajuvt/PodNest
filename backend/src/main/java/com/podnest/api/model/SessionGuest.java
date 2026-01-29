package com.podnest.api.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "session_guests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionGuest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    @JsonIgnore
    private ScheduledSession session;

    @Column(nullable = false)
    private String email;

    private String name;

    @Column(nullable = false)
    private String role; // GUEST, CO_HOST

    // Permissions
    private boolean canMic;
    private boolean canCamera;
    private boolean canScreenShare;

    @Column(nullable = false)
    private String invitationStatus; // PENDING, ACCEPTED, DECLINED
}
