import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ProgressChart } from '@/components/charts/ProgressChart';
import { useHealthSync } from '@/hooks/useHealthSync';
import { theme } from '@/constants/theme';

// TODO: fetch and display fetchAnalyticsSummary() (src/api/analytics.ts) here -
// backend workout/session totals aren't shown anywhere in the app yet.
export function ProgressScreen() {
  const { summary, ready, error } = useHealthSync();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progress</Text>
      <ProgressChart />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Health (last 7 days)</Text>
        {error ? (
          <Text style={styles.muted}>{error}</Text>
        ) : !ready ? (
          <Text style={styles.muted}>Reading Apple Health…</Text>
        ) : (
          <>
            <Text style={styles.muted}>Steps: {summary.steps.toLocaleString()}</Text>
            <Text style={styles.muted}>Workouts: {summary.workouts}</Text>
            <Text style={styles.muted}>
              Avg heart rate: {summary.avgHeartRate ? Math.round(summary.avgHeartRate) : '—'} bpm
            </Text>
          </>
        )}
      </View>
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
  card: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.card,
    gap: theme.spacing.xs,
  },
  cardTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '600' },
  muted: { color: theme.colors.muted },
});