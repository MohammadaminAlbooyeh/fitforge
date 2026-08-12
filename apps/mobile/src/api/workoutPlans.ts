import { api } from './client';
import { GeneratePlanRequest, PlanDayExercise, PlanDayExerciseUpdate, WorkoutPlan } from './types';

export async function generateWorkoutPlan(input: GeneratePlanRequest): Promise<WorkoutPlan> {
  const { data } = await api.post<WorkoutPlan>('/workout-plans/generate', input);
  return data;
}

export async function getActiveWorkoutPlan(): Promise<WorkoutPlan | null> {
  try {
    const { data } = await api.get<WorkoutPlan>('/workout-plans/active');
    return data;
  } catch (e: any) {
    if (e?.response?.status === 404) {
      return null;
    }
    throw e;
  }
}

export async function updatePlanDayExercise(
  planDayExerciseId: number,
  input: PlanDayExerciseUpdate
): Promise<PlanDayExercise> {
  const { data } = await api.patch<PlanDayExercise>(
    `/workout-plans/plan-day-exercises/${planDayExerciseId}`,
    input
  );
  return data;
}
