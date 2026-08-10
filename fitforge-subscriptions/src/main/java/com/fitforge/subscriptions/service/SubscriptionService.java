package com.fitforge.subscriptions.service;

import java.util.Optional;
import java.util.UUID;

import com.fitforge.subscriptions.model.Subscription;
import com.fitforge.subscriptions.repository.SubscriptionRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SubscriptionService {

    private final SubscriptionRepository repository;

    public SubscriptionService(SubscriptionRepository repository) {
        this.repository = repository;
    }

    public Optional<Subscription> findByUser(Long userId) {
        return repository.findByUserId(userId);
    }

    @Transactional
    public Subscription save(Subscription subscription) {
        return repository.save(subscription);
    }

    @Transactional
    public Subscription createFreeSubscription(Long userId) {
        Subscription subscription = new Subscription();
        subscription.setUserId(userId);
        subscription.setPlan(com.fitforge.subscriptions.model.Plan.FREE);
        subscription.setStatus(Subscription.Status.ACTIVE);
        subscription.setCurrentPeriodEnd(null);
        return repository.save(subscription);
    }

    public static String eventId() {
        return UUID.randomUUID().toString();
    }
}