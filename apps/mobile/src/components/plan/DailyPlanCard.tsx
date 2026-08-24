import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/common/Card';
import { getDailyPlan } from '@/api/plans';
import { PlanDay } from '@/api/types';
import { theme } from '@/constants/theme';

const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function DailyPlanCard({ onPress }: { onPress: () => void }) {
  const [plan, setPlan] = useState<PlanDay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setPlan(await getDailyPlan());
      } catch {
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

  const exercises = plan.plan_day_exercises ?? [];
  const weekday = plan.weekday !== null && plan.weekday !== undefined ? WEEKDAY_NAMES[plan.weekday] : 'Today';
  const isRest = exercises.length === 0;

  return (
    <Card onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.icon}>
          <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.weekday}>{weekday}</Text>
          <Text style={styles.title}>
            {isRest ? 'Rest Day' : `${plan.title}`}
          </Text>
          <Text style={styles.meta}>
            {isRest
              ? 'Recovery day — take it easy.'
              : `${exercises.length} exercises`}
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
