import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/common/Card';
import { StatPill } from '@/components/common/StatPill';
import { theme } from '@/constants/theme';
import type { EnhancedAnalytics, User } from '@/api/types';

type Props = {
  user: User | null;
  enhanced: EnhancedAnalytics | null;
};

const GOAL_LABELS: Record<string, string> = {
  lose_weight: 'Lose Weight',
  gain_muscle: 'Gain Muscle',
};

function weeklyAdherence(enhanced: EnhancedAnalytics | null, target: number | null): number {
  if (!enhanced || !target || enhanced.weekly_volume.length === 0) return 0;
  const lastWeek = enhanced.weekly_volume[enhanced.weekly_volume.length - 1];
  return Math.min(100, Math.round((lastWeek.workouts / target) * 100));
}

function goalValue(user: User | null): { value: string; target: string | null } {
  if (!user) return { value: '—', target: null };
  const target = user.available_days_per_week ? `${user.available_days_per_week}` : null;
  return { value: GOAL_LABELS[user.goal ?? ''] ?? 'Fitness', target };
}

export function GoalsCard({ user, enhanced }: Props) {
  const goal = goalValue(user);
  const targetDays = user?.available_days_per_week ?? null;
  const adherence = weeklyAdherence(enhanced, targetDays);
  const weight = user?.weight_kg != null ? `${user.weight_kg} kg` : '—';
  const weightTarget = goal.target ? `Goal: ${goal.target} workouts/wk` : 'Set a weekly goal';

  return (
    <Card title="Your Goals">
      <View style={styles.pills}>
        <StatPill label="Weight" value={weight} color={theme.colors.accent} />
        <StatPill label="Weekly goal" value={goal.target ?? '—'} color={theme.colors.primary} />
        <StatPill
          label="Adherence"
          value={`${adherence}%`}
          color={adherence >= 70 ? theme.colors.success : theme.colors.danger}
        />
      </View>

      <View style={styles.track}>
        <View style={[styles.trackFill, { width: `${adherence}%` }]} />
      </View>

      <View style={styles.footer}>
        <Ionicons name="flag-outline" size={14} color={theme.colors.muted} />
        <Text style={styles.footerText}>{goal.value} · {weightTarget}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  pills: { flexDirection: 'row', justifyContent: 'space-around', marginTop: theme.spacing.sm },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
    overflow: 'hidden',
    marginTop: theme.spacing.md,
  },
  trackFill: { height: '100%', borderRadius: 4, backgroundColor: theme.colors.success },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: theme.spacing.sm },
  footerText: { color: theme.colors.muted, fontSize: 12 },
});