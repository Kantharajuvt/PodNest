package com.podnest.api.repository;

import com.podnest.api.model.Subscription;
import com.podnest.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findByUser(User user);

    Optional<Subscription> findByGatewayPaymentId(String gatewayPaymentId);
}
