import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { isRevenueCatConfigured, purchaseProOffering } from '@/services/revenuecat';
import { theme } from '@/constants/theme';

const PLANS = [
  {
    id: '6-month',
    price: '$9.99',
    period: '/month',
    detail: '6 month subscriptions',
    featured: true,
  },
  {
    id: '3-month',
    price: '$15.99',
    period: '/month',
    detail: '3 month subscriptions',
    featured: false,
  },
];

const FEATURES = ['Unlimited exercise videos', 'Weekly diet meal plan', 'Advice from professional trainers'];

export function PaywallScreen({ navigation }: any) {
  const { isPro, entitlements, purchase } = useSubscription();
  const { user } = useAuth();
  const [buying, setBuying] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(PLANS[0].id);

  const startPurchase = async () => {
    setBuying(true);
    try {
      const productId = isRevenueCatConfigured()
        ? await purchaseProOffering(user?.id)
        : undefined;
      await purchase(productId);
    } catch (e: any) {
      Alert.alert(
        'Purchase failed',
        e?.message ?? 'Something went wrong while purchasing. Please try again.',
      );
    } finally {
      setBuying(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Purchase Pro</Text>

      {isPro ? (
        <>
          <Text style={styles.subtitle}>You are already a Pro member.</Text>
          <Button
            title="Manage subscription"
            onPress={() => navigation.navigate('ManageSubscription')}
          />
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>You have 5 days left of 30 day trail</Text>
          <Text style={styles.plan}>Current plan: {entitlements?.plan ?? 'FREE'}</Text>

          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              onPress={() => setSelectedPlan(plan.id)}
              style={[
                styles.planCard,
                plan.id === selectedPlan && styles.planCardSelected,
              ]}
            >
              <View style={styles.planHeaderRow}>
                <Text
                  style={[
                    styles.planPrice,
                    plan.id === selectedPlan && styles.planPriceSelected,
                  ]}
                >
                  {plan.price}
                  <Text style={styles.planPeriod}>{plan.period}</Text>
                </Text>
                {plan.id === selectedPlan && (
                  <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                )}
              </View>
              <Text
                style={[
                  styles.planDetail,
                  plan.id === selectedPlan && styles.planDetailSelected,
                ]}
              >
                {plan.detail}
              </Text>
              {FEATURES.map((f) => (
                <View key={f} style={styles.featureRow}>
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color={plan.id === selectedPlan ? '#FFFFFF' : theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.featureText,
                      plan.id === selectedPlan && styles.featureTextSelected,
                    ]}
                  >
                    {f}
                  </Text>
                </View>
              ))}
            </Card>
          ))}

          <Text style={styles.thanksNotNow} onPress={() => navigation.goBack()}>
            Thanks, Not Now
          </Text>
          <Button title="Purchase" onPress={startPurchase} disabled={buying} variant="accent" />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: 60 },
  title: { color: theme.colors.text, fontSize: 26, fontWeight: '800' },
  subtitle: { color: theme.colors.muted, fontSize: 14 },
  plan: { color: theme.colors.muted, fontSize: 13 },
  planCard: { gap: theme.spacing.xs, borderWidth: 1, borderColor: theme.colors.border },
  planCardSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  planHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planPrice: { color: theme.colors.text, fontSize: 24, fontWeight: '800' },
  planPriceSelected: { color: '#FFFFFF' },
  planPeriod: { fontSize: 13, fontWeight: '500' },
  planDetail: { color: theme.colors.muted, fontSize: 13, marginBottom: theme.spacing.xs },
  planDetailSelected: { color: 'rgba(255,255,255,0.85)' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  featureText: { color: theme.colors.text, fontSize: 12 },
  featureTextSelected: { color: '#FFFFFF' },
  thanksNotNow: { color: theme.colors.muted, textAlign: 'center', fontSize: 13, marginTop: theme.spacing.sm },
});
