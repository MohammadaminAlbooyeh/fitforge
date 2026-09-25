import { db } from './client';
import { exercises } from './schema';
import { sql } from 'drizzle-orm';

const DEFAULT_EXERCISES: Array<{ id: string; name: string; muscleGroup: string; equipment?: string }> = [
  { id: 'bench-press', name: 'Bench Press', muscleGroup: 'Chest', equipment: 'Barbell' },
  { id: 'squat', name: 'Squat', muscleGroup: 'Legs', equipment: 'Barbell' },
  { id: 'deadlift', name: 'Deadlift', muscleGroup: 'Back', equipment: 'Barbell' },
  { id: 'pull-up', name: 'Pull-up', muscleGroup: 'Back', equipment: 'Bodyweight' },
  { id: 'overhead-press', name: 'Overhead Press', muscleGroup: 'Shoulders', equipment: 'Barbell' },
  { id: 'push-up', name: 'Push-up', muscleGroup: 'Chest', equipment: 'Bodyweight' },
  { id: 'plank', name: 'Plank', muscleGroup: 'Core', equipment: 'Bodyweight' },
  { id: 'bicep-curl', name: 'Bicep Curl', muscleGroup: 'Arms', equipment: 'Dumbbell' },
];

export async function seedDefaultExercises() {
  const existing = await db.select({ count: sql<number>`count(*)` }).from(exercises);
  if ((existing[0]?.count ?? 0) > 0) return;

  await db.insert(exercises).values(
    DEFAULT_EXERCISES.map((e) => ({
      id: e.id,
      name: e.name,
      muscleGroup: e.muscleGroup,
      equipment: e.equipment ?? null,
      isCustom: false,
    }))
  );
}
