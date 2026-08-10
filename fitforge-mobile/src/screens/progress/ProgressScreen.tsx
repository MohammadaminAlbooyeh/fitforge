import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ProgressChart } from '@/components/charts/ProgressChart';
import { theme } from '@/constants/theme';

export function ProgressScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progress</Text>
      <ProgressChart />
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
});