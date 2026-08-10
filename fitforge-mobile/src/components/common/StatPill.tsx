import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type Props = {
  label: string;
  value: string;
  color?: string;
};

export function StatPill({ label, value, color = theme.colors.primary }: Props) {
  return (
    <View style={styles.container}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 2 },
  value: { fontSize: 16, fontWeight: '700' },
  label: { fontSize: 12, color: theme.colors.muted },
});
