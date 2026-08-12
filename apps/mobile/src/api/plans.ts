import { api } from './client';
import { DailyWorkoutPlan, PlanExercise } from './types';

export async function getDailyPlan(offset = 0): Promise<DailyWorkoutPlan> {
  const { data } = await api.get<DailyWorkoutPlan>('/plans/daily', { params: { offset } });
  return data;
}

export async function getWeeklyPlan(): Promise<DailyWorkoutPlan[]> {
  const { data } = await api.get<DailyWorkoutPlan[]>('/plans/week');
  return data;
}

export type { PlanExercise };
