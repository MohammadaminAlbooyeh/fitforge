import { api } from './client';
import { DailyNutritionSummary, NutritionLog, NutritionLogCreateInput } from './types';

export async function createNutritionLog(input: NutritionLogCreateInput): Promise<NutritionLog> {
  const { data } = await api.post<NutritionLog>('/nutrition/', input);
  return data;
}

export async function getDailySummary(day: string): Promise<DailyNutritionSummary> {
  const { data } = await api.get<DailyNutritionSummary>('/nutrition/day', {
    params: { day },
  });
  return data;
}
