package com.podnest.api.repository;

import com.podnest.api.model.SessionGuest;
import com.podnest.api.model.ScheduledSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SessionGuestRepository extends JpaRepository<SessionGuest, Long> {
    List<SessionGuest> findBySession(ScheduledSession session);
}
