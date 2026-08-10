import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { useSubscription } from '@/hooks/useSubscription';
import { theme } from '@/constants/theme';
import { formatDate } from '@/utils/formatters';

export function ManageSubscriptionScreen({ navigation }: any) {
  const { entitlements, isPro } = useSubscription();

  const disableAutoRenew = async () => {
    // TODO: revenuecat SDK -> restore/refund or server-side cancel via webhook.
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
        <Button title="Cancel auto-renew" onPress={disableAutoRenew} />
      ) : (
        <Button
          title="Upgrade to Pro"
          onPress={() => navigation.navigate('Paywall')}
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