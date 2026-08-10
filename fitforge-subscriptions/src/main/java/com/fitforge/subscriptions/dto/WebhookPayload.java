package com.fitforge.subscriptions.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Minimal RevenueCat webhook payload. RevenueCat sends a top-level "event" object;
 * we map the fields that matter for entitlement resolution.
 */
public record WebhookPayload(
        String type,
        @NotBlank String appUserId,
        String productId,
        Long expirationAtMs,
        Long purchasedAtMs) {

    public static final String TYPE_INITIAL_PURCHASE = "INITIAL_PURCHASE";
    public static final String TYPE_RENEWAL = "RENEWAL";
    public static final String TYPE_CANCELLATION = "CANCELLATION";
    public static final String TYPE_EXPIRATION = "EXPIRATION";
    public static final String TYPE_UNCANCELLATION = "UNCANCELLATION";
}