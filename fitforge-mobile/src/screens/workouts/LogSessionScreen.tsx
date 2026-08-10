import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { SetLogger } from '@/components/workout/SetLogger';
import { Button } from '@/components/common/Button';
import { createWorkoutSession } from '@/api/workouts';
import { useWorkouts } from '@/hooks/useWorkouts';
import { theme } from '@/constants/theme';

type LoggedSet = { exerciseId: number; label: string; weight: string; reps: string };

export function LogSessionScreen({ route }: any) {
  const { workoutId } = route.params;
  const [logs, setLogs] = useState<LoggedSet[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { workouts } = useWorkouts();
  const workout = workouts.find((w) => w.id === workoutId);

  useEffect(() => {
    if (workout?.exercises.length) {
      setLogs(
        workout.exercises.map((entry) => ({
          exerciseId: entry.exercise.id,
          label: entry.exercise.name,
          weight: String(entry.weight_kg ?? ''),
          reps: String(entry.reps ?? ''),
        }))
      );
    }
  }, [workout?.id]);

  const saveSession = async () => {
    setSaving(true);
    setError(null);
    try {
      await createWorkoutSession(workoutId, {
        sets: logs.map((log) => ({
          exercise_id: log.exerciseId,
          weight_kg: log.weight ? Number(log.weight) : undefined,
          reps: log.reps ? Number(log.reps) : undefined,
        })),
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
      {logs.map((log, index) => (
        <SetLogger
          key={index}
          index={index}
          label={log.label}
          onChange={(field, value) => {
            const next = [...logs];
            next[index] = { ...next[index], [field]: value };
            setLogs(next);
          }}
        />
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
});
