import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const exercises = sqliteTable('exercises', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  muscleGroup: text('muscle_group').notNull(),
  equipment: text('equipment'),
  isCustom: integer('is_custom', { mode: 'boolean' }).notNull().default(false),
});

export const workoutSessions = sqliteTable('workout_sessions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  notes: text('notes'),
});

export const setLogs = sqliteTable('set_logs', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => workoutSessions.id, { onDelete: 'cascade' }),
  exerciseId: text('exercise_id').notNull().references(() => exercises.id),
  setNumber: integer('set_number').notNull(),
  reps: integer('reps'),
  weightKg: real('weight_kg'),
  durationSec: integer('duration_sec'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const nutritionEntries = sqliteTable('nutrition_entries', {
  id: text('id').primaryKey(),
  loggedAt: integer('logged_at', { mode: 'timestamp' }).notNull(),
  name: text('name').notNull(),
  calories: integer('calories').notNull(),
  proteinG: real('protein_g'),
  carbsG: real('carbs_g'),
  fatG: real('fat_g'),
});

export const bodyMeasurements = sqliteTable('body_measurements', {
  id: text('id').primaryKey(),
  recordedAt: integer('recorded_at', { mode: 'timestamp' }).notNull(),
  weightKg: real('weight_kg'),
  bodyFatPct: real('body_fat_pct'),
});
