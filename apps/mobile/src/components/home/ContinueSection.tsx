import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/common/Card';
import { theme } from '@/constants/theme';
import type { DailyWorkoutPlan, NutritionLog, WorkoutLog } from '@/api/types';
import { formatDate } from '@/utils/formatters';

type Props = {
  plan: DailyWorkoutPlan | null;
  logs: WorkoutLog[];
  meals: NutritionLog[];
  onPlan: () => void;
  onWorkout: () => void;
  onMeal: () => void;
};

function latest(logs: WorkoutLog[]): WorkoutLog | null {
  return logs.length > 0 ? logs[0] : null;
}

export function ContinueSection({ plan, logs, meals, onPlan, onWorkout, onMeal }: Props) {
  const lastWorkout = latest([...logs].sort((a, b) =>
    new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  ));
  const lastMeal = meals.length > 0 ? meals[meals.length - 1] : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Continue where you left off</Text>

      {lastWorkout ? (
        <Row
          icon="barbell-outline"
          label="Last workout"
          value={formatDate(lastWorkout.completed_at)}
          onPress={onWorkout}
        />
      ) : null}

      {lastMeal ? (
        <Row
          icon="restaurant-outline"
          label="Last meal"
          value={`${lastMeal.food_item} · ${Math.round(lastMeal.calories)} cal`}
          onPress={onMeal}
        />
      ) : null}

      {plan ? (
        <Row
          icon="calendar-outline"
          label="Plan"
          value={plan.rest ? 'Rest day' : `${plan.title} · ${plan.focus}`}
          onPress={onPlan}
        />
      ) : null}
    </View>
  );
}

function Row({
  icon,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.cardWrap} onPress={onPress}>
      <Card style={styles.card}>
        <Ionicons name={icon} size={18} color={theme.colors.primary} />
        <View style={styles.cardText}>
          <Text style={styles.cardLabel}>{label}</Text>
          <Text style={styles.cardValue} numberOfLines={1}>{value}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={theme.colors.muted} />
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { gap: theme.spacing.sm },
  title: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  cardWrap: { borderRadius: theme.radius.lg },
  card: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  cardText: { flex: 1, gap: 2 },
  cardLabel: { color: theme.colors.muted, fontSize: 11 },
  cardValue: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
});