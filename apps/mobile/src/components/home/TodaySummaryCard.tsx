import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/common/Card';
import { StatPill } from '@/components/common/StatPill';
import { theme } from '@/constants/theme';
import type { DailyNutritionSummary, WorkoutLog } from '@/api/types';
import { toISODate } from '@/utils/formatters';

const STEP_GOAL = 18000;
const CALORIE_GOAL = 2200;

type Props = {
  nutrition: DailyNutritionSummary | null;
  logs: WorkoutLog[];
  steps: number;
};

function calorieProgress(nutrition: DailyNutritionSummary | null): number {
  const calories = nutrition?.total_calories ?? 0;
  return Math.min(1, calories / CALORIE_GOAL);
}

function workoutLabel(logs: WorkoutLog[]): { label: string; value: string } {
  const today = toISODate(new Date());
  const done = logs.filter((l) => toISODate(new Date(l.completed_at)) === today);
  if (done.length > 0) {
    return { label: 'Workout', value: 'Done' };
  }
  return { label: 'Workout', value: 'Pending' };
}

export function TodaySummaryCard({ nutrition, logs, steps }: Props) {
  const calories = Math.round(nutrition?.total_calories ?? 0);
  const workout = workoutLabel(logs);
  const stepsProgress = Math.min(1, steps / STEP_GOAL);
  const overall = Math.round(((calorieProgress(nutrition) + stepsProgress + (workout.value === 'Done' ? 1 : 0)) / 3) * 100);

  return (
    <Card title="Today">
      <View style={styles.pills}>
        <StatPill label="Calories" value={calories > 0 ? `${calories}` : '—'} color={theme.colors.primary} />
        <StatPill
          label="Steps"
          value={steps > 0 ? steps.toLocaleString() : '—'}
          color={theme.colors.accent}
        />
        <StatPill
          label={workout.label}
          value={workout.value}
          color={workout.value === 'Done' ? theme.colors.success : theme.colors.muted}
        />
      </View>

      <View style={styles.bars}>
        <Bar label="Calories" value={calorieProgress(nutrition)} color={theme.colors.primary} />
        <Bar label="Steps" value={stepsProgress} color={theme.colors.accent} />
        <Bar
          label="Workout"
          value={workout.value === 'Done' ? 1 : 0}
          color={theme.colors.success}
        />
      </View>

      <Text style={styles.overall}>Overall today: {overall}%</Text>
    </Card>
  );
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${value * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pills: { flexDirection: 'row', justifyContent: 'space-around', marginTop: theme.spacing.sm },
  bars: { gap: theme.spacing.sm, marginTop: theme.spacing.md },
  barRow: { alignItems: 'center', gap: theme.spacing.sm },
  barLabel: { color: theme.colors.muted, fontSize: 12, width: 64 },
  barTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: theme.colors.border, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  overall: { color: theme.colors.muted, fontSize: 12, textAlign: 'right', marginTop: theme.spacing.sm },
});