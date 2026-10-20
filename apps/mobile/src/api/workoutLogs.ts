import { api } from './client';
import { NextSetSuggestion, PersonalRecord, WorkoutLog, WorkoutLogCreateInput } from './types';
import { enqueueWorkoutLog, isNetworkError } from '@/utils/offlineQueue';

export interface CreateWorkoutLogResult {
  log: WorkoutLog | null;
  queuedOffline: boolean;
}

/** Logs a session; if the request fails because the device has no
 * connectivity (not because the server rejected it), the log is persisted
 * locally and retried automatically once the device is back online
 * (see `utils/offlineSync`) instead of losing the user's session data. */
export async function createWorkoutLog(
  input: WorkoutLogCreateInput
): Promise<CreateWorkoutLogResult> {
  try {
    const { data } = await api.post<WorkoutLog>('/workout-logs/', input);
    return { log: data, queuedOffline: false };
  } catch (error) {
    if (isNetworkError(error)) {
      await enqueueWorkoutLog(input);
      return { log: null, queuedOffline: true };
    }
    throw error;
  }
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
