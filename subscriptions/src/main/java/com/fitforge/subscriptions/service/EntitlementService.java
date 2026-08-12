package com.fitforge.subscriptions.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import com.fitforge.subscriptions.dto.WebhookPayload;
import com.fitforge.subscriptions.model.Plan;
import com.fitforge.subscriptions.model.Subscription;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EntitlementService {

    private final SubscriptionService subscriptionService;

    public EntitlementService(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    public Subscription getOrCreateEntitlement(Long userId) {
        return subscriptionService.findByUser(userId)
                .orElseGet(() -> subscriptionService.createFreeSubscription(userId));
    }

    public boolean isPro(Long userId) {
        Subscription subscription = getOrCreateEntitlement(userId);
        return subscription.getPlan() == Plan.PRO
                && subscription.getStatus() == Subscription.Status.ACTIVE;
    }

    @Transactional
    public Subscription purchase(Long userId, String productId) {
        Subscription subscription = getOrCreateEntitlement(userId);
        Instant now = Instant.now();
        if (subscription.getCreatedAt() == null) {
            subscription.setCreatedAt(now);
        }
        subscription.setUpdatedAt(now);
        subscription.setPlan(Plan.PRO);
        subscription.setStatus(Subscription.Status.ACTIVE);
        subscription.setStoreProductId(productId);
        subscription.setCurrentPeriodEnd(now.plus(30, ChronoUnit.DAYS));
        return subscriptionService.save(subscription);
    }

    @Transactional
    public Subscription cancel(Long userId) {
        Subscription subscription = getOrCreateEntitlement(userId);
        subscription.setStatus(Subscription.Status.CANCELLED);
        subscription.setUpdatedAt(Instant.now());
        return subscriptionService.save(subscription);
    }

    @Transactional
    public Subscription applyWebhook(WebhookPayload payload) {
        Long userId = Long.valueOf(payload.appUserId().trim());
        Subscription subscription = getOrCreateEntitlement(userId);

        Instant now = Instant.now();
        if (subscription.getCreatedAt() == null) {
            subscription.setCreatedAt(now);
        }
        subscription.setUpdatedAt(now);

        switch (payload.type()) {
            case WebhookPayload.TYPE_INITIAL_PURCHASE,
                 WebhookPayload.TYPE_RENEWAL,
                 WebhookPayload.TYPE_UNCANCELLATION -> {
                subscription.setPlan(Plan.PRO);
                subscription.setStatus(Subscription.Status.ACTIVE);
                subscription.setStoreProductId(payload.productId());
                if (payload.expirationAtMs() != null) {
                    subscription.setCurrentPeriodEnd(Instant.ofEpochMilli(payload.expirationAtMs()));
                }
            }
            case WebhookPayload.TYPE_CANCELLATION ->
                    subscription.setStatus(Subscription.Status.CANCELLED);
            case WebhookPayload.TYPE_EXPIRATION -> {
                subscription.setStatus(Subscription.Status.EXPIRED);
                subscription.setPlan(Plan.FREE);
                subscription.setCurrentPeriodEnd(null);
            }
            default -> { }
        }

        return subscriptionService.save(subscription);
    }
}