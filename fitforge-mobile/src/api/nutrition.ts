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

export async function getEntriesForDay(day: string): Promise<NutritionLog[]> {
  const { data } = await api.get<NutritionLog[]>('/nutrition/day/entries', {
    params: { day },
  });
  return data;
}

export async function getNutritionLog(id: number): Promise<NutritionLog> {
  const { data } = await api.get<NutritionLog>(`/nutrition/${id}`);
  return data;
}

export async function updateNutritionLog(
  id: number,
  input: Partial<NutritionLogCreateInput>
): Promise<NutritionLog> {
  const { data } = await api.patch<NutritionLog>(`/nutrition/${id}`, input);
  return data;
}

export async function deleteNutritionLog(id: number): Promise<void> {
  await api.delete(`/nutrition/${id}`);
}
