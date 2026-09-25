import { create } from 'zustand';
import { randomUUID } from 'expo-crypto';
import { db } from '../db/client';
import { nutritionEntries } from '../db/schema';
import { desc, gte } from 'drizzle-orm';

export type NutritionEntry = typeof nutritionEntries.$inferSelect;

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

interface NutritionState {
  todayEntries: NutritionEntry[];
  loadToday: () => Promise<void>;
  addEntry: (name: string, calories: number, proteinG?: number, carbsG?: number, fatG?: number) => Promise<void>;
}

export const useNutritionStore = create<NutritionState>((set) => ({
  todayEntries: [],

  loadToday: async () => {
    const now = new Date();
    const rows = await db
      .select()
      .from(nutritionEntries)
      .where(gte(nutritionEntries.loggedAt, startOfDay(now)))
      .orderBy(desc(nutritionEntries.loggedAt));
    set({ todayEntries: rows.filter((r) => r.loggedAt <= endOfDay(now)) });
  },

  addEntry: async (name, calories, proteinG, carbsG, fatG) => {
    await db.insert(nutritionEntries).values({
      id: randomUUID(),
      loggedAt: new Date(),
      name,
      calories,
      proteinG: proteinG ?? null,
      carbsG: carbsG ?? null,
      fatG: fatG ?? null,
    });
    const now = new Date();
    const rows = await db
      .select()
      .from(nutritionEntries)
      .where(gte(nutritionEntries.loggedAt, startOfDay(now)))
      .orderBy(desc(nutritionEntries.loggedAt));
    set({ todayEntries: rows });
  },
}));
