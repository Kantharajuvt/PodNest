package com.podnest.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recordings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recording {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @JsonIgnoreProperties({ "owner", "recordings" })
    @ToString.Exclude
    @ManyToOne
    @JoinColumn(name = "studio_id", nullable = false)
    private Studio studio;

    private String duration;

    @Column(nullable = false)
    private String status; // e.g., "ready", "processing"

    private String thumbnailUrl;
    private String fileUrl;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
