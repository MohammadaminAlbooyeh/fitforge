package com.fitforge.subscriptions.controller;

import com.fitforge.subscriptions.dto.PurchaseRequest;
import com.fitforge.subscriptions.dto.SubscriptionResponse;
import com.fitforge.subscriptions.model.Subscription;
import com.fitforge.subscriptions.service.EntitlementService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/entitlements")
public class SubscriptionController {

    private final EntitlementService entitlementService;

    public SubscriptionController(EntitlementService entitlementService) {
        this.entitlementService = entitlementService;
    }

    @GetMapping("/{userId}")
    public SubscriptionResponse entitlements(@PathVariable Long userId) {
        Subscription subscription = entitlementService.getOrCreateEntitlement(userId);
        if (subscription == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No entitlement found");
        }
        return toResponse(subscription);
    }

    @PostMapping("/{userId}/purchase")
    public SubscriptionResponse purchase(
            @PathVariable Long userId, @RequestBody(required = false) PurchaseRequest payload) {
        String productId = payload != null ? payload.productId() : null;
        return toResponse(entitlementService.purchase(userId, productId));
    }

    @PostMapping("/{userId}/cancel")
    public SubscriptionResponse cancel(@PathVariable Long userId) {
        return toResponse(entitlementService.cancel(userId));
    }

    static SubscriptionResponse toResponse(Subscription subscription) {
        return new SubscriptionResponse(
                subscription.getUserId(),
                subscription.getPlan(),
                subscription.getStatus(),
                subscription.getStoreProductId(),
                subscription.getCurrentPeriodEnd());
    }
}