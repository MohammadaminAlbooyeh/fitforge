import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { ExerciseCard } from '@/components/workout/ExerciseCard';
import { Button } from '@/components/common/Button';
import { useWorkouts } from '@/hooks/useWorkouts';
import { theme } from '@/constants/theme';

export function WorkoutDetailScreen({ route, navigation }: any) {
  const { workoutId } = route.params;
  const { workouts } = useWorkouts();
  const workout = workouts.find((w) => w.id === workoutId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{workout?.name ?? 'Workout'}</Text>
      {workout?.exercises.map((exercise) => (
        <ExerciseCard key={exercise.id} exercise={exercise} />
      ))}
      <Button
        title="Log session"
        onPress={() => navigation.getParent()?.navigate('LogSession', { workoutId })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md, gap: theme.spacing.md, paddingBottom: 120 },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '800' },
});
