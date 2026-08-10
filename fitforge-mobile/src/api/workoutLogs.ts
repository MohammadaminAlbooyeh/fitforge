import { api } from './client';
import { WorkoutLog, WorkoutLogCreateInput } from './types';

export async function createWorkoutLog(input: WorkoutLogCreateInput): Promise<WorkoutLog> {
  const { data } = await api.post<WorkoutLog>('/workout-logs/', input);
  return data;
}

export async function listWorkoutLogs(): Promise<WorkoutLog[]> {
  const { data } = await api.get<WorkoutLog[]>('/workout-logs/');
  return data;
}
