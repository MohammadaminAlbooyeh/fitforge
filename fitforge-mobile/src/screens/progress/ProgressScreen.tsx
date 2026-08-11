import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CircularProgress } from '@/components/common/CircularProgress';
import { Card } from '@/components/common/Card';
import { ProgressChart } from '@/components/charts/ProgressChart';
import { WeeklyVolumeChart } from '@/components/charts/WeeklyVolumeChart';
import { useHealthSync } from '@/hooks/useHealthSync';
import { useSubscription } from '@/hooks/useSubscription';
import { fetchAnalyticsSummary } from '@/api/analytics';
import { api } from '@/api/client';
import { AnalyticsSummary, EnhancedAnalytics } from '@/api/types';
import { theme } from '@/constants/theme';

const STEP_GOAL = 18000;

export function ProgressScreen({ navigation }: any) {
  const { summary, ready, error } = useHealthSync();
  const { isPro } = useSubscription();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [enhanced, setEnhanced] = useState<EnhancedAnalytics | null>(null);

  useEffect(() => {
    if (!isPro) return;
    fetchAnalyticsSummary()
      .then(setAnalytics)
      .catch(() => setAnalytics(null));
  }, [isPro]);

  useEffect(() => {
    api.get('/analytics/enhanced')
      .then((r) => setEnhanced(r.data))
      .catch(() => {});
  }, []);

  const stepsProgress = Math.min(1, summary.steps / STEP_GOAL);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Activity</Text>

      <Card style={styles.ringCard}>
        <CircularProgress progress={stepsProgress} size={170} strokeWidth={16}>
          <Ionicons name="footsteps-outline" size={22} color={theme.colors.accent} />
          <Text style={styles.stepsValue}>{summary.steps.toLocaleString()}</Text>
          <Text style={styles.stepsLabel}>Steps out of {STEP_GOAL / 1000}K</Text>
        </CircularProgress>

        {error ? (
          <Text style={styles.muted}>{error}</Text>
        ) : !ready ? (
          <Text style={styles.muted}>Reading health data…</Text>
        ) : (
          <View style={styles.metricsRow}>
            <Metric label="Distance" value={`${(summary.steps * 0.0008).toFixed(2)} km`} />
            <Metric label="Workouts" value={String(summary.workouts)} />
            <Metric
              label="Avg HR"
              value={summary.avgHeartRate ? `${Math.round(summary.avgHeartRate)} bpm` : '—'}
            />
          </View>
        )}
      </Card>

      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Activity</Text>
        </View>
        <View style={styles.activityRow}>
          <ActivityStat icon="flame-outline" label="Eaten" value="734 kcal" color={theme.colors.success} />
          <ActivityStat icon="flash-outline" label="Burned" value="363 kcal" color={theme.colors.accent} />
        </View>
      </Card>

      <Card onPress={() => navigation.navigate('PRHistory')}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Personal Records</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
        </View>
      </Card>

      {isPro && analytics && (
        <Card>
          <Text style={styles.cardTitle}>Training Summary</Text>
          <View style={styles.activityRow}>
            <Metric label="Workouts" value={String(analytics.total_workouts)} />
            <Metric label="Sessions" value={String(analytics.total_sessions)} />
            <Metric label="Sets" value={String(analytics.total_sets)} />
          </View>
        </Card>
      )}

      {enhanced && (
        <Card>
          <Text style={styles.cardTitle}>Streak</Text>
          <View style={styles.activityRow}>
            <Metric label="Current" value={`${enhanced.streak_days} days`} />
            <Metric label="Best" value={`${enhanced.longest_streak} days`} />
          </View>
        </Card>
      )}

      <WeeklyVolumeChart />
      <ProgressChart />
    </ScrollView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricItem}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function ActivityStat({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.activityStat}>
      <View style={[styles.activityIcon, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md, gap: theme.spacing.md, paddingBottom: 120 },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '800' },
  ringCard: { alignItems: 'center', gap: theme.spacing.md },
  stepsValue: { color: theme.colors.text, fontSize: 22, fontWeight: '800', marginTop: 4 },
  stepsLabel: { color: theme.colors.muted, fontSize: 12 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  metricItem: { alignItems: 'center', gap: 2 },
  metricValue: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  metricLabel: { color: theme.colors.muted, fontSize: 11 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  activityRow: { flexDirection: 'row', gap: theme.spacing.lg, marginTop: theme.spacing.xs },
  activityStat: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muted: { color: theme.colors.muted },
});
