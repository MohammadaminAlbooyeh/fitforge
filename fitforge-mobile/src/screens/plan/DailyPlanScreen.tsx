import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Avatar } from '@/components/common/Avatar';
import { Card } from '@/components/common/Card';
import { useAuth } from '@/hooks/useAuth';
import { useDailyPlan } from '@/hooks/useDailyPlan';
import { theme } from '@/constants/theme';
import { PlanExercise } from '@/api/types';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function DailyPlanScreen({ navigation }: any) {
  const { user } = useAuth();
  const [offset, setOffset] = useState(0);
  const { plan, loading, error } = useDailyPlan(offset);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const doneCount = Object.values(checked).filter(Boolean).length;
  const total = plan?.exercises.length ?? 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="chevron-back" size={22} color={theme.colors.text} onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Exercise</Text>
        <Avatar name={user?.full_name} size={32} />
      </View>

      <View style={styles.weekStrip}>
        {WEEKDAYS.map((label, i) => {
          const dayOffset = i;
          const isSelected = dayOffset === offset;
          return (
            <View key={i} style={styles.dayColumn} onTouchEnd={() => setOffset(dayOffset)}>
              <Text style={styles.weekdayLabel}>{label}</Text>
              <View style={[styles.dayCircle, isSelected && styles.dayCircleActive]}>
                <Text style={[styles.dayNumber, isSelected && styles.dayNumberActive]}>
                  {isSelected && plan ? plan.day : dayOffset + 1}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {loading || !plan ? (
        <Text style={styles.muted}>Loading…</Text>
      ) : (
        <>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              Your Progress: {doneCount}/{total}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${total ? (doneCount / total) * 100 : 0}%` }]}
            />
          </View>

          <Text style={styles.planTitle}>{plan.title}</Text>

          <View style={styles.metaRow}>
            <MetaStat label="Calories" value={`${plan.duration_minutes * 8} cal`} />
            <MetaStat label="Time" value={`${plan.duration_minutes} mins`} />
            <MetaStat label="Level" value={plan.rest ? 'Rest' : 'Medium'} />
          </View>

          <View style={styles.roundHeader}>
            <Text style={styles.roundTitle}>Round 1</Text>
            <Text style={styles.roundSubtitle}>{plan.focus}</Text>
          </View>

          {plan.exercises.map((exercise: PlanExercise, index: number) => {
            const key = `${exercise.name}-${index}`;
            const isDone = !!checked[key];
            return (
              <Card
                key={key}
                onPress={() => setChecked((prev) => ({ ...prev, [key]: !prev[key] }))}
                style={styles.exerciseRow}
              >
                <View style={[styles.checkCircle, isDone && styles.checkCircleDone]}>
                  {isDone && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </View>
                <View style={styles.exerciseIcon}>
                  <Ionicons name="body-outline" size={20} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseMeta}>
                    {exercise.sets} sets · {exercise.reps} reps
                    {exercise.rest_seconds > 0 ? ` · rest ${exercise.rest_seconds}s` : ''}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
              </Card>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

function MetaStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaStat}>
      <Text style={styles.metaValue}>{value}</Text>
      <Text style={styles.metaLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md, gap: theme.spacing.md, paddingBottom: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: theme.colors.text, fontSize: 20, fontWeight: '800' },
  weekStrip: { flexDirection: 'row', justifyContent: 'space-between' },
  dayColumn: { alignItems: 'center', gap: 6 },
  weekdayLabel: { color: theme.colors.muted, fontSize: 12 },
  dayCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  dayCircleActive: { backgroundColor: theme.colors.primary },
  dayNumber: { color: theme.colors.text, fontSize: 13, fontWeight: '600' },
  dayNumberActive: { color: '#FFFFFF' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { color: theme.colors.text, fontSize: 13, fontWeight: '700' },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: theme.colors.border, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: theme.colors.accent },
  planTitle: { color: theme.colors.text, fontSize: 24, fontWeight: '800' },
  metaRow: { flexDirection: 'row', gap: theme.spacing.lg },
  metaStat: { gap: 2 },
  metaValue: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  metaLabel: { color: theme.colors.muted, fontSize: 11 },
  roundHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  roundTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  roundSubtitle: { color: theme.colors.muted, fontSize: 12 },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDone: { backgroundColor: theme.colors.success, borderColor: theme.colors.success },
  exerciseIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F0EBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseName: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  exerciseMeta: { color: theme.colors.muted, fontSize: 12 },
  muted: { color: theme.colors.muted, textAlign: 'center', marginTop: theme.spacing.lg },
  error: { color: theme.colors.danger },
});
