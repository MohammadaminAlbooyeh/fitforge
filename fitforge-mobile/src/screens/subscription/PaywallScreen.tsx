import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { isRevenueCatConfigured, purchaseProOffering } from '@/services/revenuecat';
import { theme } from '@/constants/theme';

export function PaywallScreen({ navigation }: any) {
  const { isPro, entitlements, purchase } = useSubscription();
  const { user } = useAuth();
  const [buying, setBuying] = useState(false);

  const startPurchase = async () => {
    setBuying(true);
    try {
      // If RevenueCat keys are configured, go through the real store purchase;
      // otherwise fall back to the backend-only flow (dev/testing).
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
    <View style={styles.container}>
      <Text style={styles.title}>FitForge Pro</Text>
      {isPro ? (
        <>
          <Text style={styles.body}>You are already a Pro member.</Text>
          <Button
            title="Manage subscription"
            onPress={() => navigation.navigate('ManageSubscription')}
          />
        </>
      ) : (
        <>
          <Text style={styles.body}>Current plan: {entitlements?.plan ?? 'FREE'}</Text>
          <Button title="Subscribe to Pro" onPress={startPurchase} disabled={buying} />
          <Button
            title="Not now"
            variant="ghost"
            onPress={() => navigation.goBack()}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.md,
  },
  title: {
    color: theme.colors.primary,
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  body: { color: theme.colors.text, fontSize: 16, textAlign: 'center' },
});