import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { theme } from '@/constants/theme';

export function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { entitlements, isPro, loading } = useSubscription();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{user?.full_name ?? 'Profile'}</Text>
      <Text style={styles.muted}>{user?.email}</Text>
      <Text style={styles.muted}>
        {loading ? 'Checking subscription...' : `Plan: ${entitlements?.plan ?? 'FREE'}`}
      </Text>
      {!loading && (
        <Button
          title={isPro ? 'Manage subscription' : 'Upgrade to Pro'}
          variant="ghost"
          onPress={() => navigation.navigate('ManageSubscription')}
        />
      )}
      <Button title="Log out" onPress={logout} />
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
  muted: { color: theme.colors.muted },
});