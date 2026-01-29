package com.podnest.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class CashfreeService {

    @Value("${cashfree.client.id}")
    private String clientId;

    @Value("${cashfree.client.secret}")
    private String clientSecret;

    @Value("${cashfree.environment}")
    private String environment;

    private final RestTemplate restTemplate = new RestTemplate();

    private String getBaseUrl() {
        return environment.equalsIgnoreCase("PRODUCTION")
                ? "https://api.cashfree.com/pg"
                : "https://sandbox.cashfree.com/pg";
    }

    public Map<String, Object> createOrder(double amount, String customerId, String customerEmail,
            String customerPhone) {
        String url = getBaseUrl() + "/orders";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-client-id", clientId);
        headers.set("x-client-secret", clientSecret);
        headers.set("x-api-version", "2023-08-01");

        Map<String, Object> customerDetails = new HashMap<>();
        customerDetails.put("customer_id", customerId);
        customerDetails.put("customer_email", customerEmail);
        customerDetails.put("customer_phone", customerPhone);

        Map<String, Object> orderMeta = new HashMap<>();
        orderMeta.put("return_url", "http://localhost:5173/payment-status?order_id={order_id}");

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("order_amount", amount);
        requestBody.put("order_currency", "INR");
        requestBody.put("customer_details", customerDetails);
        requestBody.put("order_meta", orderMeta);
        requestBody.put("order_note", "PodNest Subscription");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        return restTemplate.postForObject(url, entity, Map.class);
    }

    public Map<String, Object> getOrder(String orderId) {
        String url = getBaseUrl() + "/orders/" + orderId;

        HttpHeaders headers = new HttpHeaders();
        headers.set("x-client-id", clientId);
        headers.set("x-client-secret", clientSecret);
        headers.set("x-api-version", "2023-08-01");

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        return restTemplate.exchange(url, HttpMethod.GET, entity, Map.class).getBody();
    }
}
