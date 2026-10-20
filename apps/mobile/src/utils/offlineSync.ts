import NetInfo from '@react-native-community/netinfo';

import { api } from '@/api/client';
import { WorkoutLog } from '@/api/types';
import { getQueuedWorkoutLogs, removeQueuedWorkoutLog } from '@/utils/offlineQueue';

let flushing = false;
let unsubscribe: (() => void) | null = null;

/** Retries every locally-queued workout log against the server. Safe to
 * call repeatedly (e.g. on every reconnect) — `client_id` makes a retry of
 * an already-synced entry a no-op on the backend instead of a duplicate,
 * and a second overlapping call is skipped via the `flushing` guard. */
export async function flushWorkoutLogQueue(): Promise<void> {
  if (flushing) return;
  flushing = true;
  try {
    const queue = await getQueuedWorkoutLogs();
    for (const entry of queue) {
      try {
        await api.post<WorkoutLog>('/workout-logs/', entry.input);
        await removeQueuedWorkoutLog(entry.clientId);
      } catch (error: any) {
        if (error?.response) {
          // Server rejected it outright (not a connectivity issue) — drop it
          // rather than retrying forever on a request that will never succeed.
          await removeQueuedWorkoutLog(entry.clientId);
        }
        // else: still offline, leave it queued for the next flush.
      }
    }
  } finally {
    flushing = false;
  }
}

/** Starts watching connectivity and flushing the offline queue whenever the
 * device comes back online. Call once from the app root. */
export function initOfflineSync(): void {
  if (unsubscribe) return;
  unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable !== false) {
      flushWorkoutLogQueue();
    }
  });
  flushWorkoutLogQueue();
}

export function stopOfflineSync(): void {
  unsubscribe?.();
  unsubscribe = null;
}
