package com.podnest.api.repository;

import com.podnest.api.model.ScheduledSession;
import com.podnest.api.model.Studio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScheduledSessionRepository extends JpaRepository<ScheduledSession, Long> {
    List<ScheduledSession> findByStudioInOrderByStartTimeAsc(List<Studio> studios);
}
