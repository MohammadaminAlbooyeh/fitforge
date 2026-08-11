import React, { useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { Avatar } from '@/components/common/Avatar';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { useWorkoutPlan } from '@/hooks/useWorkoutPlan';
import { createWorkoutLog } from '@/api/workoutLogs';
import { updatePlanDayExercise } from '@/api/workoutPlans';
import { PlanDayExercise } from '@/api/types';
import { theme } from '@/constants/theme';
import { getMuscleGroupVisual } from '@/utils/muscleGroupIcon';

function midpointReps(repsRange: string): number {
  const [lo, hi] = repsRange.split('-').map((n) => parseInt(n, 10));
  if (Number.isFinite(lo) && Number.isFinite(hi)) return Math.round((lo + hi) / 2);
  return Number.isFinite(lo) ? lo : 10;
}

export function DailyPlanScreen({ navigation }: any) {
  const { user } = useAuth();
  const { plan, loading, error, reload } = useWorkoutPlan();
  const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [logging, setLogging] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      reload();
    }, [reload])
  );

  const selectedDay = useMemo(() => {
    if (!plan) return null;
    return plan.plan_days.find((d) => d.id === selectedDayId) ?? plan.plan_days[0] ?? null;
  }, [plan, selectedDayId]);

  const activeExercises = selectedDay?.plan_day_exercises.filter((pde) => !pde.skipped) ?? [];
  const doneCount = activeExercises.filter((pde) => checked[String(pde.id)]).length;
  const total = activeExercises.length;

  const handleLogSession = async () => {
    if (!selectedDay) return;
    const doneExercises = activeExercises.filter((pde) => checked[String(pde.id)]);
    if (doneExercises.length === 0) {
      Alert.alert('Nothing checked off', 'Check off the exercises you completed first.');
      return;
    }
    setLogging(true);
    try {
      const log = await createWorkoutLog({
        plan_day_id: selectedDay.id,
        status: doneExercises.length === total ? 'completed' : 'partial',
        sets: doneExercises.map((pde) => ({
          exercise_id: pde.exercise.id,
          reps: midpointReps(pde.reps_range),
          set_number: 1,
        })),
      });
      setChecked({});
      const prCount = log.log_sets.filter((s) => s.is_personal_record).length;
      Alert.alert(
        'Session logged',
        prCount > 0
          ? `Nice work — this session was added to your history. 🏆 ${prCount} new personal record${prCount > 1 ? 's' : ''}!`
          : 'Nice work — this session was added to your history.'
      );
    } catch (e: any) {
      Alert.alert('Could not log session', e?.message ?? 'Something went wrong.');
    } finally {
      setLogging(false);
    }
  };

  const handleSkip = async (pde: PlanDayExercise) => {
    setUpdatingId(pde.id);
    try {
      await updatePlanDayExercise(pde.id, { skipped: !pde.skipped });
      setChecked((prev) => ({ ...prev, [String(pde.id)]: false }));
      await reload();
    } catch (e: any) {
      Alert.alert('Could not update exercise', e?.message ?? 'Something went wrong.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReplace = async (pde: PlanDayExercise) => {
    const alternativeId = pde.exercise.alternative_exercise_id;
    if (!alternativeId) {
      Alert.alert('No alternative available', 'This exercise has no substitute set up yet.');
      return;
    }
    setUpdatingId(pde.id);
    try {
      await updatePlanDayExercise(pde.id, { exercise_id: alternativeId });
      await reload();
    } catch (e: any) {
      Alert.alert('Could not replace exercise', e?.message ?? 'Something went wrong.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.muted}>Loading your plan…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.muted}>{error}</Text>
        <Button title="Retry" variant="ghost" onPress={reload} />
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>No plan yet</Text>
        <Text style={styles.muted}>
          Answer a few questions and we'll build a split around your schedule and equipment.
        </Text>
        <Button title="Build my plan" onPress={() => navigation.navigate('GeneratePlan')} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="chevron-back" size={22} color={theme.colors.text} onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Exercise</Text>
        <Avatar name={user?.full_name} size={32} />
      </View>

      <View style={styles.dayStrip}>
        {plan.plan_days.map((day) => {
          const isSelected = day.id === (selectedDay?.id ?? plan.plan_days[0].id);
          return (
            <View key={day.id} style={styles.dayColumn} onTouchEnd={() => setSelectedDayId(day.id)}>
              <Text style={styles.dayNumberLabel}>Day {day.day_number}</Text>
              <View style={[styles.dayCircle, isSelected && styles.dayCircleActive]}>
                <Text style={[styles.dayTitleShort, isSelected && styles.dayTitleShortActive]}>
                  {day.title.slice(0, 2).toUpperCase()}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {selectedDay && (
        <>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              Your Progress: {doneCount}/{total}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${total ? (doneCount / total) * 100 : 0}%` }]} />
          </View>

          <Text style={styles.planTitle}>{selectedDay.title}</Text>
          <Text style={styles.planMeta}>
            {plan.split_type.replace(/_/g, ' ')} · {plan.days_per_week} days/week
          </Text>

          {selectedDay.plan_day_exercises.map((pde: PlanDayExercise) => {
            const isDone = !!checked[String(pde.id)];
            const isUpdating = updatingId === pde.id;
            const visual = getMuscleGroupVisual(pde.exercise.muscle_group);
            return (
              <Card key={pde.id} style={[styles.exerciseRow, pde.skipped && styles.exerciseRowSkipped]}>
                <View
                  style={styles.exerciseRowInner}
                  onTouchEnd={() => {
                    if (!pde.skipped) {
                      setChecked((prev) => ({ ...prev, [String(pde.id)]: !prev[String(pde.id)] }));
                    }
                  }}
                >
                  <View style={[styles.checkCircle, isDone && styles.checkCircleDone]}>
                    {isDone && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                  </View>
                  <View style={[styles.exerciseIcon, { backgroundColor: `${visual.color}22` }]}>
                    <Ionicons name={visual.icon} size={20} color={visual.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.exerciseName, pde.skipped && styles.mutedText]}>
                      {pde.exercise.name}
                    </Text>
                    <Text style={styles.exerciseMeta}>
                      {pde.sets} sets · {pde.reps_range} reps · rest {pde.rest_seconds}s
                    </Text>
                    <Text style={[styles.exerciseSub, { color: visual.color }]}>
                      {visual.label} · {pde.exercise.equipment}
                    </Text>
                  </View>
                </View>
                {pde.exercise.image_url && !pde.skipped ? (
                  <Image source={{ uri: pde.exercise.image_url }} style={styles.exerciseImage} />
                ) : null}
                <View style={styles.exerciseActions}>
                  <Button
                    title={pde.skipped ? 'Unskip' : 'Skip'}
                    variant="ghost"
                    loading={isUpdating}
                    onPress={() => handleSkip(pde)}
                  />
                  {!pde.skipped && pde.exercise.alternative_exercise_id ? (
                    <Button
                      title="Replace"
                      variant="ghost"
                      loading={isUpdating}
                      onPress={() => handleReplace(pde)}
                    />
                  ) : null}
                </View>
              </Card>
            );
          })}

          <Button title="Log this session" onPress={handleLogSession} loading={logging} variant="accent" />
          <Button title="Rebuild plan" variant="ghost" onPress={() => navigation.navigate('GeneratePlan')} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md, gap: theme.spacing.md, paddingBottom: 60 },
  centered: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: theme.colors.text, fontSize: 20, fontWeight: '800' },
  dayStrip: { flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' },
  dayColumn: { alignItems: 'center', gap: 6 },
  dayNumberLabel: { color: theme.colors.muted, fontSize: 11 },
  dayCircle: {
    minWidth: 40,
    height: 40,
    paddingHorizontal: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
  },
  dayCircleActive: { backgroundColor: theme.colors.primary },
  dayTitleShort: { color: theme.colors.text, fontSize: 12, fontWeight: '700' },
  dayTitleShortActive: { color: '#FFFFFF' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { color: theme.colors.text, fontSize: 13, fontWeight: '700' },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: theme.colors.border, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: theme.colors.accent },
  planTitle: { color: theme.colors.text, fontSize: 24, fontWeight: '800' },
  planMeta: { color: theme.colors.muted, fontSize: 12, textTransform: 'capitalize' },
  exerciseRow: { flexDirection: 'column', gap: theme.spacing.sm },
  exerciseRowSkipped: { opacity: 0.5 },
  exerciseActions: { flexDirection: 'row', gap: theme.spacing.sm },
  mutedText: { textDecorationLine: 'line-through' },
  exerciseRowInner: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  exerciseImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    resizeMode: 'cover',
  },
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
  exerciseSub: { color: theme.colors.muted, fontSize: 11, textTransform: 'capitalize' },
  muted: { color: theme.colors.muted, textAlign: 'center' },
});
