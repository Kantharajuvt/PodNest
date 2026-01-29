package com.podnest.api.repository;

import com.podnest.api.model.Recording;
import com.podnest.api.model.Studio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RecordingRepository extends JpaRepository<Recording, Long> {
    List<Recording> findByStudioInOrderByCreatedAtDesc(List<Studio> studios);
}
