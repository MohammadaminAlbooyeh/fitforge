package com.fitforge.subscriptions.controller;

import jakarta.validation.Valid;

import com.fitforge.subscriptions.dto.WebhookPayload;
import com.fitforge.subscriptions.model.Subscription;
import com.fitforge.subscriptions.service.EntitlementService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/webhooks")
public class WebhookController {

    private final EntitlementService entitlementService;

    public WebhookController(EntitlementService entitlementService) {
        this.entitlementService = entitlementService;
    }

    @PostMapping("/revenuecat")
    public ResponseEntity<Void> handleRevenueCat(@Valid @RequestBody WebhookPayload payload) {
        if (payload.type() == null || payload.type().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        Subscription subscription = entitlementService.applyWebhook(payload);
        if (subscription == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        return ResponseEntity.ok().build();
    }
}