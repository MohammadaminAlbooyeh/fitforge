import { api } from './client';
import { NextSetSuggestion, PersonalRecord, WorkoutLog, WorkoutLogCreateInput } from './types';

export async function createWorkoutLog(input: WorkoutLogCreateInput): Promise<WorkoutLog> {
  const { data } = await api.post<WorkoutLog>('/workout-logs/', input);
  return data;
}

export async function listWorkoutLogs(): Promise<WorkoutLog[]> {
  const { data } = await api.get<WorkoutLog[]>('/workout-logs/');
  return data;
}

export async function listPersonalRecords(): Promise<PersonalRecord[]> {
  const { data } = await api.get<PersonalRecord[]>('/workout-logs/personal-records');
  return data;
}

export async function nextSetSuggestion(exerciseId: number): Promise<NextSetSuggestion> {
  const { data } = await api.get<NextSetSuggestion>(`/workout-logs/next-set-suggestion/${exerciseId}`);
  return data;
}
