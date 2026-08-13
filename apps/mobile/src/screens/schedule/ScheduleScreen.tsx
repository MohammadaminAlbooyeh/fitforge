import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { Card } from '@/components/common/Card';
import { getWeeklyPlan } from '@/api/plans';
import { listWorkoutLogs } from '@/api/workoutLogs';
import type { DailyWorkoutPlan, WorkoutLog } from '@/api/types';
import { theme } from '@/constants/theme';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function ScheduleScreen({ navigation }: any) {
  const [week, setWeek] = useState<DailyWorkoutPlan[]>([]);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      Promise.allSettled([getWeeklyPlan(), listWorkoutLogs()]).then(([planRes, logRes]) => {
        if (planRes.status === 'fulfilled') setWeek(planRes.value ?? []);
        if (logRes.status === 'fulfilled') setLogs(logRes.value ?? []);
        setLoading(false);
      });
    }, [])
  );

  const doneDates = new Set(logs.map((l) => l.completed_at.toString().slice(0, 10)));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="chevron-back" size={22} color={theme.colors.text} onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Schedule</Text>
        <View style={{ width: 22 }} />
      </View>

      <Text style={styles.subtitle}>This week’s plan</Text>

      {loading ? (
        <Text style={styles.muted}>Loading…</Text>
      ) : week.length === 0 ? (
        <Text style={styles.muted}>No weekly plan yet. Generate one first.</Text>
      ) : (
        week.map((day, i) => {
          const isToday = day.weekday === WEEKDAYS[(new Date().getDay() + 6) % 7];
          const done = doneDates.has(today) && isToday && !day.rest;
          return (
            <Card key={i} style={[styles.dayCard, isToday && styles.dayCardToday]}>
              <View style={styles.dayRow}>
                <View style={[styles.dayDot, done && styles.dayDotDone, day.rest && styles.dayDotRest]}>
                  {done ? (
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  ) : day.rest ? (
                    <Ionicons name="bed-outline" size={12} color={theme.colors.muted} />
                  ) : null}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.dayTitleRow}>
                    <Text style={styles.dayName}>{day.weekday}</Text>
                    {isToday && <Text style={styles.todayBadge}>Today</Text>}
                  </View>
                  <Text style={styles.dayPlan}>
                    {day.rest ? 'Rest day' : `${day.title} · ${day.focus}`}
                  </Text>
                  <Text style={styles.dayMeta}>
                    {day.rest ? 'Recovery — take it easy.' : `${day.duration_minutes} min · ${day.exercises?.length ?? 0} exercises`}
                  </Text>
                </View>
                {!day.rest && (
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={theme.colors.muted}
                    onPress={() => navigation.navigate('DailyPlan')}
                  />
                )}
              </View>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md, gap: theme.spacing.md, paddingBottom: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: theme.colors.text, fontSize: 20, fontWeight: '800' },
  subtitle: { color: theme.colors.muted, fontSize: 13, fontWeight: '600' },
  muted: { color: theme.colors.muted, textAlign: 'center', marginTop: theme.spacing.md },
  dayCard: {},
  dayCardToday: { borderWidth: 1, borderColor: theme.colors.primary },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotDone: { backgroundColor: theme.colors.success },
  dayDotRest: { backgroundColor: '#F0EEF8' },
  dayTitleRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  dayName: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  todayBadge: {
    backgroundColor: '#F0EBFF',
    borderRadius: theme.radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  dayPlan: { color: theme.colors.text, fontSize: 13, fontWeight: '600', marginTop: 2 },
  dayMeta: { color: theme.colors.muted, fontSize: 12 },
});