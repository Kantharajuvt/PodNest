package com.podnest.api.dto;

import lombok.Data;

@Data
public class SubscriptionRequest {
    private String planId; // Razorpay Plan ID
    private String billingCycle; // monthly/yearly
    private String planType; // PRO/BUSINESS
    private String phoneNumber; // Added for Cashfree
}
