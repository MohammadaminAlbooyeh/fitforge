jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  enqueueWorkoutLog,
  getQueuedWorkoutLogs,
  isNetworkError,
  removeQueuedWorkoutLog,
} from '../offlineQueue';

describe('offlineQueue', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('starts empty', async () => {
    expect(await getQueuedWorkoutLogs()).toEqual([]);
  });

  it('enqueues a log and stamps it with a client_id', async () => {
    const entry = await enqueueWorkoutLog({ status: 'completed', sets: [] });
    expect(entry.clientId).toBeTruthy();
    expect(entry.input.client_id).toBe(entry.clientId);

    const queue = await getQueuedWorkoutLogs();
    expect(queue).toHaveLength(1);
    expect(queue[0].clientId).toBe(entry.clientId);
  });

  it('keeps an explicit client_id instead of overwriting it', async () => {
    const entry = await enqueueWorkoutLog({
      status: 'completed',
      sets: [],
      client_id: 'explicit-id',
    });
    expect(entry.clientId).toBe('explicit-id');
  });

  it('removes a queued log by client_id', async () => {
    const entry = await enqueueWorkoutLog({ status: 'partial', sets: [] });
    await removeQueuedWorkoutLog(entry.clientId);
    expect(await getQueuedWorkoutLogs()).toEqual([]);
  });
});

describe('isNetworkError', () => {
  it('is true for an axios-style error with no response', () => {
    expect(isNetworkError({ message: 'Network Error' })).toBe(true);
  });

  it('is false for an error with an HTTP response', () => {
    expect(isNetworkError({ response: { status: 422 } })).toBe(false);
  });

  it('is false for non-error values', () => {
    expect(isNetworkError(null)).toBe(false);
    expect(isNetworkError(undefined)).toBe(false);
  });
});
