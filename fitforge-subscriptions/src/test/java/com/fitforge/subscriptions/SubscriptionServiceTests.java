package com.fitforge.subscriptions;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.Optional;

import com.fitforge.subscriptions.model.Plan;
import com.fitforge.subscriptions.model.Subscription;
import com.fitforge.subscriptions.repository.SubscriptionRepository;
import com.fitforge.subscriptions.service.EntitlementService;
import com.fitforge.subscriptions.service.SubscriptionService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SubscriptionServiceTests {

    @Mock
    private SubscriptionRepository repository;

    private EntitlementService entitlementService;

    @BeforeEach
    void setUp() {
        entitlementService = new EntitlementService(new SubscriptionService(repository));
    }

    @Test
    void unknownUserDefaultsToFree() {
        when(repository.findByUserId(42L)).thenReturn(Optional.empty());

        Subscription subscription = entitlementService.getOrCreateEntitlement(42L);

        assertThat(subscription.getPlan()).isEqualTo(Plan.FREE);
        assertThat(subscription.getStatus()).isEqualTo(Subscription.Status.ACTIVE);
        assertThat(entitlementService.isPro(42L)).isFalse();
    }

    @Test
    void activeProUserIsEntitled() {
        Subscription pro = new Subscription();
        pro.setUserId(7L);
        pro.setPlan(Plan.PRO);
        pro.setStatus(Subscription.Status.ACTIVE);

        when(repository.findByUserId(7L)).thenReturn(Optional.of(pro));

        assertThat(entitlementService.isPro(7L)).isTrue();
    }

    @Test
    void cancelledProUserIsNotEntitled() {
        Subscription pro = new Subscription();
        pro.setUserId(7L);
        pro.setPlan(Plan.PRO);
        pro.setStatus(Subscription.Status.CANCELLED);

        when(repository.findByUserId(7L)).thenReturn(Optional.of(pro));

        assertThat(entitlementService.isPro(7L)).isFalse();
    }

    @Test
    void purchaseGrantsActiveProSubscription() {
        Subscription free = new Subscription();
        free.setUserId(7L);
        free.setPlan(Plan.FREE);
        free.setStatus(Subscription.Status.ACTIVE);
        when(repository.findByUserId(7L)).thenReturn(Optional.of(free));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Subscription subscription = entitlementService.purchase(7L, "fitforge_pro");

        assertThat(subscription.getPlan()).isEqualTo(Plan.PRO);
        assertThat(subscription.getStatus()).isEqualTo(Subscription.Status.ACTIVE);
        assertThat(subscription.getStoreProductId()).isEqualTo("fitforge_pro");
        assertThat(subscription.getCurrentPeriodEnd()).isNotNull();
        assertThat(entitlementService.isPro(7L)).isTrue();
    }

    @Test
    void cancelMarksProSubscriptionCancelled() {
        Subscription pro = new Subscription();
        pro.setUserId(7L);
        pro.setPlan(Plan.PRO);
        pro.setStatus(Subscription.Status.ACTIVE);
        when(repository.findByUserId(7L)).thenReturn(Optional.of(pro));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Subscription subscription = entitlementService.cancel(7L);

        assertThat(subscription.getStatus()).isEqualTo(Subscription.Status.CANCELLED);
        assertThat(entitlementService.isPro(7L)).isFalse();
    }
}