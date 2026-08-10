import { api } from './client';
import { DailyWorkoutPlan } from './types';

export async function fetchDailyPlan(offset = 0): Promise<DailyWorkoutPlan> {
  const { data } = await api.get<DailyWorkoutPlan>('/plans/daily', {
    params: { offset },
  });
  return data;
}

export async function fetchWeeklyPlan(): Promise<DailyWorkoutPlan[]> {
  const { data } = await api.get<DailyWorkoutPlan[]>('/plans/week');
  return data;
}