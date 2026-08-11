import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/common/Card';
import { WorkoutExercise } from '@/api/types';
import { getMuscleGroupVisual } from '@/utils/muscleGroupIcon';
import { theme } from '@/constants/theme';

type Props = {
  exercise: WorkoutExercise;
};

export function ExerciseCard({ exercise }: Props) {
  const visual = getMuscleGroupVisual(exercise.exercise.muscle_group);
  return (
    <Card style={styles.row}>
      <View style={[styles.icon, { backgroundColor: `${visual.color}22` }]}>
        <Ionicons name={visual.icon} size={20} color={visual.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{exercise.exercise.name}</Text>
        <Text style={styles.subtitle}>
          {visual.label} · {exercise.sets} sets · {exercise.reps ?? '—'} reps ·{' '}
          {exercise.weight_kg ?? '—'} kg
        </Text>
        {exercise.exercise.image_url ? (
          <Image source={{ uri: exercise.exercise.image_url }} style={styles.image} />
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  subtitle: { color: theme.colors.muted, fontSize: 13 },
  image: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginTop: theme.spacing.sm,
    resizeMode: 'cover',
  },
});