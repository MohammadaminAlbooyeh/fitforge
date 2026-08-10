package com.fitforge.subscriptions.repository;

import java.util.Optional;

import com.fitforge.subscriptions.model.Subscription;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    Optional<Subscription> findByUserId(Long userId);
}