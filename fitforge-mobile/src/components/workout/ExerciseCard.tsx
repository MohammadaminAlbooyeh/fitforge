import React from 'react';

import { Card } from '@/components/common/Card';
import { WorkoutExercise } from '@/api/types';

type Props = {
  exercise: WorkoutExercise;
};

export function ExerciseCard({ exercise }: Props) {
  return (
    <Card
      title={exercise.exercise.name}
      subtitle={`${exercise.sets} sets · ${exercise.reps ?? '—'} reps · ${exercise.weight_kg ?? '—'} kg`}
    />
  );
}