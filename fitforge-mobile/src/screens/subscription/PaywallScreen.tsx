import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { useSubscription } from '@/hooks/useSubscription';
import { theme } from '@/constants/theme';

export function PaywallScreen({ navigation }: any) {
  const { isPro, entitlements } = useSubscription();

  const startPurchase = async () => {
    // TODO: revenuecat SDK purchase flow, then refresh() to re-check entitlements.
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
          <Button title="Subscribe to Pro" onPress={startPurchase} />
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