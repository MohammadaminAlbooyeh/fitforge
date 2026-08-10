import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { isRevenueCatConfigured, restorePurchases } from '@/services/revenuecat';
import { theme } from '@/constants/theme';
import { formatDate } from '@/utils/formatters';

export function ManageSubscriptionScreen({ navigation }: any) {
  const { entitlements, isPro, cancel, refresh } = useSubscription();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  const disableAutoRenew = async () => {
    await cancel();
  };

  const handleRestore = async () => {
    setBusy(true);
    try {
      await restorePurchases(user?.id);
      await refresh();
    } catch (e: any) {
      Alert.alert('Restore failed', e?.message ?? 'No purchases were restored.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Subscription</Text>
      <Text style={styles.muted}>Plan: {entitlements?.plan ?? 'FREE'}</Text>
      <Text style={styles.muted}>Status: {entitlements?.status ?? '—'}</Text>
      {entitlements?.currentPeriodEnd && (
        <Text style={styles.muted}>
          Renews: {formatDate(entitlements.currentPeriodEnd)}
        </Text>
      )}

      {isPro ? (
        <Button title="Cancel auto-renew" onPress={disableAutoRenew} disabled={busy} />
      ) : (
        <Button
          title="Upgrade to Pro"
          onPress={() => navigation.navigate('Paywall')}
        />
      )}
      {isRevenueCatConfigured() && (
        <Button
          title="Restore purchases"
          variant="ghost"
          onPress={handleRestore}
          disabled={busy}
        />
      )}
      <Button title="Back" variant="ghost" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.md,
  },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: 'bold' },
  muted: { color: theme.colors.muted, fontSize: 16 },
});