package com.fitforge.subscriptions.dto;

import com.fitforge.subscriptions.model.Plan;
import com.fitforge.subscriptions.model.Subscription.Status;

public record SubscriptionResponse(
        Long userId,
        Plan plan,
        Status status,
        String storeProductId,
        java.time.Instant currentPeriodEnd) {
}