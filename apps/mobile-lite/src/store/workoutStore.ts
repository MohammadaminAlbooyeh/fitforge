import { create } from 'zustand';
import { randomUUID } from 'expo-crypto';
import { db } from '../db/client';
import { workoutSessions, setLogs, exercises } from '../db/schema';
import { desc, eq } from 'drizzle-orm';

export type Exercise = typeof exercises.$inferSelect;
export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type SetLog = typeof setLogs.$inferSelect;

interface WorkoutState {
  exerciseList: Exercise[];
  sessions: WorkoutSession[];
  loadExercises: () => Promise<void>;
  loadSessions: () => Promise<void>;
  startSession: (name: string) => Promise<string>;
  logSet: (sessionId: string, exerciseId: string, setNumber: number, reps: number, weightKg: number) => Promise<void>;
  completeSession: (sessionId: string) => Promise<void>;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  exerciseList: [],
  sessions: [],

  loadExercises: async () => {
    const rows = await db.select().from(exercises).orderBy(exercises.name);
    set({ exerciseList: rows });
  },

  loadSessions: async () => {
    const rows = await db.select().from(workoutSessions).orderBy(desc(workoutSessions.startedAt));
    set({ sessions: rows });
  },

  startSession: async (name: string) => {
    const id = randomUUID();
    await db.insert(workoutSessions).values({
      id,
      name,
      startedAt: new Date(),
    });
    await get().loadSessions();
    return id;
  },

  logSet: async (sessionId, exerciseId, setNumber, reps, weightKg) => {
    await db.insert(setLogs).values({
      id: randomUUID(),
      sessionId,
      exerciseId,
      setNumber,
      reps,
      weightKg,
      createdAt: new Date(),
    });
  },

  completeSession: async (sessionId) => {
    await db.update(workoutSessions).set({ completedAt: new Date() }).where(eq(workoutSessions.id, sessionId));
    await get().loadSessions();
  },
}));
