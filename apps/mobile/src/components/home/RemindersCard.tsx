import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/common/Card';
import { theme } from '@/constants/theme';
import type { DailyWorkoutPlan, NutritionLog, WorkoutLog } from '@/api/types';
import { toISODate } from '@/utils/formatters';

type Reminder = {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  tone: string;
};

type Props = {
  plan: DailyWorkoutPlan | null;
  logs: WorkoutLog[];
  meals: NutritionLog[];
};

const TONES = {
  primary: theme.colors.primary,
  success: theme.colors.success,
  accent: theme.colors.accent,
  danger: theme.colors.danger,
};

function workoutReminder(plan: DailyWorkoutPlan | null, logs: WorkoutLog[]): Reminder | null {
  if (!plan || plan.rest) return null;
  const today = toISODate(new Date());
  const done = logs.some((l) => toISODate(new Date(l.completed_at)) === today);
  if (done) return null;
  return {
    icon: 'barbell-outline',
    text: `Don’t forget: ${plan.title} is on today’s plan.`,
    tone: TONES.primary,
  };
}

function mealReminder(meals: NutritionLog[]): Reminder | null {
  if (meals.length === 0) {
    return { icon: 'cafe-outline', text: 'No meals logged yet today.', tone: TONES.accent };
  }
  return null;
}

function streakReminder(logs: WorkoutLog[], plan: DailyWorkoutPlan | null): Reminder | null {
  const today = toISODate(new Date());
  const done = logs.some((l) => toISODate(new Date(l.completed_at)) === today);
  if (done && !plan?.rest) {
    return {
      icon: 'checkmark-circle-outline',
      text: 'Workout done — you’re all caught up today.',
      tone: TONES.success,
    };
  }
  return null;
}

export function RemindersCard({ plan, logs, meals }: Props) {
  const reminders = [workoutReminder(plan, logs), mealReminder(meals), streakReminder(logs, plan)].filter(
    (r): r is Reminder => r !== null
  );

  if (reminders.length === 0) return null;

  return (
    <Card title="Reminders">
      <View style={styles.list}>
        {reminders.map((r, i) => (
          <View key={i} style={styles.row}>
            <Ionicons name={r.icon} size={18} color={r.tone} />
            <Text style={styles.text}>{r.text}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  list: { gap: theme.spacing.sm, marginTop: theme.spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  text: { color: theme.colors.text, fontSize: 13, flex: 1 },
});