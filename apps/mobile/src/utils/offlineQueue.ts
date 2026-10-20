import AsyncStorage from '@react-native-async-storage/async-storage';

import { WorkoutLogCreateInput } from '@/api/types';

const QUEUE_KEY = 'fitforge.offline.workoutLogQueue';

export interface QueuedWorkoutLog {
  clientId: string;
  input: WorkoutLogCreateInput;
  queuedAt: string;
}

function generateClientId(): string {
  return `offline-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function getQueuedWorkoutLogs(): Promise<QueuedWorkoutLog[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QueuedWorkoutLog[];
  } catch {
    return [];
  }
}

async function saveQueue(queue: QueuedWorkoutLog[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/** Persists a workout log locally so it can be retried once back online,
 * stamping it with a client_id so a successful retry is idempotent even if
 * an earlier attempt actually reached the server before the error surfaced. */
export async function enqueueWorkoutLog(input: WorkoutLogCreateInput): Promise<QueuedWorkoutLog> {
  const queue = await getQueuedWorkoutLogs();
  const clientId = input.client_id ?? generateClientId();
  const entry: QueuedWorkoutLog = {
    clientId,
    input: { ...input, client_id: clientId },
    queuedAt: new Date().toISOString(),
  };
  queue.push(entry);
  await saveQueue(queue);
  return entry;
}

export async function removeQueuedWorkoutLog(clientId: string): Promise<void> {
  const queue = await getQueuedWorkoutLogs();
  await saveQueue(queue.filter((q) => q.clientId !== clientId));
}

/** True if a network-level failure (no HTTP response at all) as opposed to
 * a rejection the server actually returned (validation error, 401, etc.) —
 * only the former should be queued for retry. */
export function isNetworkError(error: unknown): boolean {
  return Boolean(error) && typeof error === 'object' && !(error as { response?: unknown }).response;
}
