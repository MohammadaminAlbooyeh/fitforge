import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';

import { SetLogger } from '@/components/workout/SetLogger';
import { RestTimer } from '@/components/workout/RestTimer';
import { Button } from '@/components/common/Button';
import { createWorkoutSession } from '@/api/workouts';
import { useWorkouts } from '@/hooks/useWorkouts';
import { theme } from '@/constants/theme';

const DEFAULT_REST_SECONDS = 90;

type SetEntry = { weight: string; reps: string; completed: boolean };
type ExerciseGroup = { exerciseId: number; label: string; sets: SetEntry[] };

export function LogSessionScreen({ route }: any) {
  const { workoutId } = route.params;
  const [groups, setGroups] = useState<ExerciseGroup[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restKey, setRestKey] = useState<string | null>(null);
  const { workouts } = useWorkouts();
  const workout = workouts.find((w) => w.id === workoutId);

  useEffect(() => {
    if (workout?.exercises.length) {
      setGroups(
        workout.exercises.map((entry) => ({
          exerciseId: entry.exercise.id,
          label: entry.exercise.name,
          sets: Array.from({ length: entry.sets ?? 1 }, () => ({
            weight: entry.weight_kg != null ? String(entry.weight_kg) : '',
            reps: entry.reps != null ? String(entry.reps) : '',
            completed: false,
          })),
        }))
      );
    }
  }, [workout?.id]);

  const updateSet = (groupIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => {
    setGroups((prev) => {
      const next = [...prev];
      const sets = [...next[groupIndex].sets];
      sets[setIndex] = { ...sets[setIndex], [field]: value };
      next[groupIndex] = { ...next[groupIndex], sets };
      return next;
    });
  };

  const toggleSetComplete = (groupIndex: number, setIndex: number) => {
    const key = `${groupIndex}-${setIndex}`;
    const nowCompleted = !groups[groupIndex].sets[setIndex].completed;
    setGroups((prev) => {
      const next = [...prev];
      const sets = [...next[groupIndex].sets];
      sets[setIndex] = { ...sets[setIndex], completed: nowCompleted };
      next[groupIndex] = { ...next[groupIndex], sets };
      return next;
    });
    setRestKey(nowCompleted ? key : null);
  };

  const addSet = (groupIndex: number) => {
    setGroups((prev) => {
      const next = [...prev];
      const sets = next[groupIndex].sets;
      const last = sets[sets.length - 1];
      next[groupIndex] = {
        ...next[groupIndex],
        sets: [...sets, { weight: last?.weight ?? '', reps: last?.reps ?? '', completed: false }],
      };
      return next;
    });
  };

  const saveSession = async () => {
    setSaving(true);
    setError(null);
    try {
      await createWorkoutSession(workoutId, {
        sets: groups.flatMap((group) =>
          group.sets.map((set) => ({
            exercise_id: group.exerciseId,
            weight_kg: set.weight ? Number(set.weight) : undefined,
            reps: set.reps ? Number(set.reps) : undefined,
          }))
        ),
      });
    } catch (e: any) {
      setError(e.message ?? 'Failed to save session');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Log session</Text>
      {!workout && <Text style={styles.error}>Workout not loaded yet.</Text>}
      {groups.map((group, groupIndex) => (
        <View key={group.exerciseId} style={styles.exerciseBlock}>
          <Text style={styles.exerciseName}>{group.label}</Text>
          {group.sets.map((set, setIndex) => (
            <View key={setIndex}>
              <SetLogger
                index={setIndex}
                weight={set.weight}
                reps={set.reps}
                completed={set.completed}
                onChange={(field, value) => updateSet(groupIndex, setIndex, field, value)}
                onToggleComplete={() => toggleSetComplete(groupIndex, setIndex)}
              />
              {restKey === `${groupIndex}-${setIndex}` && (
                <RestTimer seconds={DEFAULT_REST_SECONDS} onDone={() => setRestKey(null)} />
              )}
            </View>
          ))}
          <Pressable onPress={() => addSet(groupIndex)}>
            <Text style={styles.addSet}>+ Add set</Text>
          </Pressable>
        </View>
      ))}
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title="Save session" onPress={saveSession} loading={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md, gap: theme.spacing.md },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: 'bold' },
  error: { color: theme.colors.danger },
  exerciseBlock: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  exerciseName: { color: theme.colors.text, fontSize: 18, fontWeight: '700' },
  addSet: { color: theme.colors.primary, fontWeight: '700', paddingTop: theme.spacing.xs },
});
