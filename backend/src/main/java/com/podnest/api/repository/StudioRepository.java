package com.podnest.api.repository;

import com.podnest.api.model.Studio;
import com.podnest.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudioRepository extends JpaRepository<Studio, Long> {
    List<Studio> findByOwner(User owner);
    java.util.Optional<Studio> findByInviteCode(String inviteCode);
}
