package com.podnest.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "studios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Studio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @JsonIgnore
    @ToString.Exclude
    @OneToMany(mappedBy = "studio", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Recording> recordings = new ArrayList<>();

    @Column(nullable = false, unique = true)
    private String inviteCode;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (inviteCode == null) {
            inviteCode = java.util.UUID.randomUUID().toString().substring(0, 8);
        }
    }
}
