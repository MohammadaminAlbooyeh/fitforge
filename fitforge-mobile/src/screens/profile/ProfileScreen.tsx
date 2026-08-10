import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { theme } from '@/constants/theme';

export function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{user?.full_name ?? 'Profile'}</Text>
      <Text style={styles.muted}>{user?.email}</Text>
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