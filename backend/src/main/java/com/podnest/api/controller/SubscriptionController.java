package com.podnest.api.controller;

import com.podnest.api.dto.SubscriptionRequest;
import com.podnest.api.model.*;
import com.podnest.api.repository.SubscriptionRepository;
import com.podnest.api.repository.UserRepository;
import com.podnest.api.service.CashfreeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import org.json.JSONObject;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    @Autowired
    private CashfreeService cashfreeService;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createSubscription(@RequestBody SubscriptionRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        try {
            double amount = request.getPlanType().equals("PRO")
                    ? (request.getBillingCycle().equals("yearly") ? 9590 : 999)
                    : (request.getBillingCycle().equals("yearly") ? 33590 : 3499);

            String phoneNumber = user.getPhoneNumber();
            if (phoneNumber == null || phoneNumber.isEmpty()) {
                phoneNumber = request.getPhoneNumber();
            }
            if (phoneNumber == null || phoneNumber.isEmpty()) {
                phoneNumber = "9999999999";
            }

            Map<String, Object> order = cashfreeService.createOrder(
                    amount,
                    user.getId().toString(),
                    user.getEmail(),
                    phoneNumber);

            // Update user phoneNumber if it was provided and is currently empty
            if (request.getPhoneNumber() != null && !request.getPhoneNumber().isEmpty() &&
                    (user.getPhoneNumber() == null || user.getPhoneNumber().isEmpty())) {
                user.setPhoneNumber(request.getPhoneNumber());
                userRepository.save(user);
            }

            Subscription subscription = subscriptionRepository.findByUser(user)
                    .orElse(new Subscription());

            subscription.setUser(user);
            subscription.setGatewayPaymentId((String) order.get("order_id"));
            subscription.setPlanType(PlanType.valueOf(request.getPlanType()));
            subscription.setBillingCycle(request.getBillingCycle());
            subscription.setStatus(SubscriptionStatus.PENDING);

            subscriptionRepository.save(subscription);

            return ResponseEntity.ok(Map.of(
                    "paymentSessionId", order.get("payment_session_id"),
                    "orderId", order.get("order_id")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        return subscriptionRepository.findByUser(user)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(@RequestBody String payload,
            @RequestHeader(value = "x-cf-signature", required = false) String signature) {

        JSONObject json = new JSONObject(payload);
        JSONObject data = json.getJSONObject("data");
        JSONObject order = data.getJSONObject("order");
        String orderId = order.getString("order_id");
        String paymentStatus = order.getString("order_status");

        subscriptionRepository.findByGatewayPaymentId(orderId).ifPresent(sub -> {
            if ("PAID".equals(paymentStatus)) {
                sub.setStatus(SubscriptionStatus.ACTIVE);
                sub.setCurrentPeriodEnd(LocalDateTime.now().plusMonths(
                        sub.getBillingCycle().equals("yearly") ? 12 : 1));
            } else if ("FAILED".equals(paymentStatus)) {
                sub.setStatus(SubscriptionStatus.HALTED);
            }
            subscriptionRepository.save(sub);
        });

        return ResponseEntity.ok().build();
    }
}
