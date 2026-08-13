import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { Card } from '@/components/common/Card';
import { StatPill } from '@/components/common/StatPill';
import { api } from '@/api/client';
import { useAuth } from '@/hooks/useAuth';
import type { EnhancedAnalytics, WorkoutLog } from '@/api/types';
import { theme } from '@/constants/theme';

const GOAL_LABELS: Record<string, string> = {
  lose_weight: 'Lose Weight',
  gain_muscle: 'Gain Muscle',
};

export function GoalsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [enhanced, setEnhanced] = useState<EnhancedAnalytics | null>(null);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);

  useFocusEffect(
    useCallback(() => {
      api.get('/analytics/enhanced').then((r) => setEnhanced(r.data)).catch(() => {});
      api.get('/workout-logs/').then((r) => setLogs(r.data ?? [])).catch(() => {});
    }, [])
  );

  useEffect(() => {}, [enhanced, logs]);

  const weeklyTarget = user?.available_days_per_week ?? null;
  const goalText = GOAL_LABELS[user?.goal ?? ''] ?? (user?.goal ?? 'Fitness');
  const weight = user?.weight_kg != null ? `${user.weight_kg} kg` : null;

  const weeklyVolume = enhanced?.weekly_volume ?? [];
  const thisWeek =
    logs.length > 0
      ? logs.filter((l) => {
          const d = new Date(l.completed_at);
          const start = new Date();
          start.setHours(0, 0, 0, 0);
          start.setDate(start.getDate() - start.getDay());
          return d >= start;
        }).length
      : (weeklyVolume[weeklyVolume.length - 1]?.workouts ?? 0);

  const adherence = weeklyTarget ? Math.min(100, Math.round((thisWeek / weeklyTarget) * 100)) : null;
  const completedRate = weeklyTarget
    ? `${Math.round((thisWeek / weeklyTarget) * 100)}%`
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="chevron-back" size={22} color={theme.colors.text} onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Goals</Text>
        <View style={{ width: 22 }} />
      </View>

      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Primary Goal</Text>
          <View style={styles.goalBadge}>
            <Text style={styles.goalBadgeText}>{goalText}</Text>
          </View>
        </View>
        <Text style={styles.cardSubtitle}>
          {weight ? `Current weight: ${weight}` : 'Add your weight to track progress.'}
        </Text>
      </Card>

      {weeklyTarget ? (
        <Card title="This Week">
          <View style={styles.pills}>
            <StatPill label="Completed" value={`${thisWeek}`} color={theme.colors.primary} />
            <StatPill label="Target" value={`${weeklyTarget}`} color={theme.colors.muted} />
            <StatPill
              label="Adherence"
              value={adherence != null ? `${adherence}%` : '—'}
              color={completionColor(adherence)}
            />
          </View>
          <View style={styles.track}>
            <View style={[styles.trackFill, { width: `${adherence ?? 0}%` }]} />
          </View>
          <Text style={styles.hint}>
            {completedRate ? `You're at ${completedRate} of your weekly workout goal.` : ''}
          </Text>
        </Card>
      ) : null}

      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Streak</Text>
        </View>
        <View style={styles.pills}>
          <StatPill
            label="Current streak"
            value={`${enhanced?.streak_days ?? 0}d`}
            color="#F59E0B"
          />
          <StatPill
            label="Best streak"
            value={`${enhanced?.longest_streak ?? 0}d`}
            color={theme.colors.accent}
          />
        </View>
      </Card>

      {enhanced && enhanced.summary.total_sessions > 0 ? (
        <Card title="All-time">
          <View style={styles.pills}>
            <StatPill label="Workouts" value={`${enhanced.summary.total_workouts}`} color={theme.colors.primary} />
            <StatPill label="Sessions" value={`${enhanced.summary.total_sessions}`} color={theme.colors.accent} />
            <StatPill label="Sets" value={`${enhanced.summary.total_sets}`} color={theme.colors.success} />
          </View>
        </Card>
      ) : null}
    </ScrollView>
  );
}

function completionColor(adherence: number | null): string {
  if (adherence == null) return theme.colors.muted;
  return adherence >= 70 ? theme.colors.success : theme.colors.danger;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md, gap: theme.spacing.md, paddingBottom: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: theme.colors.text, fontSize: 20, fontWeight: '800' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  cardSubtitle: { color: theme.colors.muted, fontSize: 13, marginTop: theme.spacing.xs },
  goalBadge: { backgroundColor: '#F0EBFF', borderRadius: theme.radius.pill, paddingHorizontal: 12, paddingVertical: 5 },
  goalBadgeText: { color: theme.colors.primary, fontSize: 12, fontWeight: '700' },
  pills: { flexDirection: 'row', justifyContent: 'space-around', marginTop: theme.spacing.sm },
  track: { height: 8, borderRadius: 4, backgroundColor: theme.colors.border, overflow: 'hidden', marginTop: theme.spacing.md },
  trackFill: { height: '100%', borderRadius: 4, backgroundColor: theme.colors.success },
  hint: { color: theme.colors.muted, fontSize: 12, marginTop: theme.spacing.sm },
});