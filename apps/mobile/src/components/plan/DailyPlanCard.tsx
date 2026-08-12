import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/common/Card';
import { getDailyPlan } from '@/api/plans';
import { DailyWorkoutPlan } from '@/api/types';
import { theme } from '@/constants/theme';

export function DailyPlanCard({ onPress }: { onPress: () => void }) {
  const [plan, setPlan] = useState<DailyWorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setPlan(await getDailyPlan());
      } catch {
        // daily plan is optional; home still renders without it
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <Card>
        <ActivityIndicator color={theme.colors.primary} />
      </Card>
    );
  }

  if (!plan) {
    return null;
  }

  const exercises = plan.exercises ?? [];

  return (
    <Card onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.icon}>
          <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.weekday}>{plan.weekday}</Text>
          <Text style={styles.title}>
            {plan.rest ? 'Rest Day' : `${plan.title} · ${plan.focus}`}
          </Text>
          <Text style={styles.meta}>
            {plan.rest
              ? 'Recovery day — take it easy.'
              : `${exercises.length} exercises · ${plan.duration_minutes} min`}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0EBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekday: { color: theme.colors.primary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  title: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  meta: { color: theme.colors.muted, fontSize: 12 },
});
