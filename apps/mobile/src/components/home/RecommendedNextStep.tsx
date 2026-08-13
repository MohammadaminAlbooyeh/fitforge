import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '@/constants/theme';
import type { DailyWorkoutPlan, NutritionLog, WorkoutLog } from '@/api/types';
import { toISODate } from '@/utils/formatters';

type Props = {
  plan: DailyWorkoutPlan | null;
  logs: WorkoutLog[];
  meals: NutritionLog[];
  onPlan: () => void;
  onMeal: () => void;
  onWorkout: () => void;
};

type Suggestion = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
  action: () => void;
};

function todayWorkoutDone(logs: WorkoutLog[]): boolean {
  const today = toISODate(new Date());
  return logs.some((l) => toISODate(new Date(l.completed_at)) === today);
}

function suggest({ plan, logs, meals, onPlan, onMeal, onWorkout }: Props): Suggestion {
  // Nothing eaten yet today → logging wins.
  if (meals.length === 0) {
    return {
      icon: 'cafe-outline',
      title: 'Log your breakfast',
      detail: 'Start tracking today’s calories.',
      action: onMeal,
    };
  }

  // Has an active plan (not a rest day) and hasn’t trained today.
  if (plan && !plan.rest && !todayWorkoutDone(logs)) {
    return {
      icon: 'barbell-outline',
      title: 'Check today’s plan',
      detail: `${plan.title} · ${plan.focus} · ${plan.duration_minutes} min`,
      action: onPlan,
    };
  }

  // Has been good today → encourage a little extra.
  return {
    icon: 'timer-outline',
    title: '10 min cardio',
    detail: 'A quick session to keep the streak going.',
    action: onWorkout,
  };
}

export function RecommendedNextStep(props: Props) {
  const s = suggest(props);
  return (
    <TouchableOpacity onPress={s.action} activeOpacity={0.9}>
      <LinearGradient
        colors={theme.gradients.accent}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.row}>
          <View style={styles.icon}>
            <Ionicons name={s.icon} size={22} color="#FFFFFF" />
          </View>
          <View style={styles.text}>
            <Text style={styles.title}>{s.title}</Text>
            <Text style={styles.detail}>{s.detail}</Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: { borderRadius: theme.radius.lg, padding: theme.spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 2 },
  title: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  detail: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
});