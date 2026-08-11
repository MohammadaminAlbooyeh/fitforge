import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { ExpoHealthKit } from 'expo-health-kit/build/runtime';
import { HealthKitDataType } from 'expo-health-kit/build/types';
import * as HealthConnect from 'react-native-health-connect';

export type HealthSample = {
  timestamp: number;
  value: number;
  unit: string;
};

export type HealthSummary = {
  steps: number;
  workouts: number;
  avgHeartRate: number | null;
};

type HealthSyncState = {
  samples: HealthSample[];
  summary: HealthSummary;
  ready: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const LOOKBACK_DAYS = 7;

const DATA_TYPES = [
  HealthKitDataType.STEPS,
  HealthKitDataType.WORKOUT,
  HealthKitDataType.HEART_RATE,
];

const HEALTH_CONNECT_PERMISSIONS = [
  { accessType: 'read' as const, recordType: 'Steps' as const },
  { accessType: 'read' as const, recordType: 'ExerciseSession' as const },
  { accessType: 'read' as const, recordType: 'HeartRate' as const },
];

export function useHealthSync(): HealthSyncState {
  const [samples, setSamples] = useState<HealthSample[]>([]);
  const [summary, setSummary] = useState<HealthSummary>({
    steps: 0,
    workouts: 0,
    avgHeartRate: null,
  });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAndroid = useCallback(async () => {
    try {
      const status = await HealthConnect.getSdkStatus();
      // SdkAvailabilityStatus.SDK_AVAILABLE === 3; anything else means Health
      // Connect isn't installed/available on this device.
      if (status !== 3) {
        setReady(true);
        return;
      }

      await HealthConnect.initialize();
      await HealthConnect.requestPermission(HEALTH_CONNECT_PERMISSIONS);

      const end = new Date();
      const start = new Date(end.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
      const timeRangeFilter = {
        operator: 'between' as const,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      };

      const [stepsResult, exerciseResult, heartRateResult] = await Promise.all([
        HealthConnect.readRecords('Steps', { timeRangeFilter }),
        HealthConnect.readRecords('ExerciseSession', { timeRangeFilter }),
        HealthConnect.readRecords('HeartRate', { timeRangeFilter }),
      ]);

      const steps = stepsResult.records.reduce((sum, r) => sum + r.count, 0);
      const workouts = exerciseResult.records.length;
      const heartRateSamples = heartRateResult.records.flatMap((r) => r.samples);
      const avgHeartRate =
        heartRateSamples.length > 0
          ? heartRateSamples.reduce((sum, s) => sum + s.beatsPerMinute, 0) / heartRateSamples.length
          : null;

      const allSamples: HealthSample[] = [
        ...stepsResult.records.map((r) => ({
          timestamp: new Date(r.startTime).getTime(),
          value: r.count,
          unit: 'count',
        })),
        ...heartRateSamples.map((s) => ({
          timestamp: new Date(s.time).getTime(),
          value: s.beatsPerMinute,
          unit: 'bpm',
        })),
      ];

      setSamples(allSamples);
      setSummary({ steps, workouts, avgHeartRate });
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to read Health Connect data');
    } finally {
      setReady(true);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (Platform.OS === 'android') {
      await refreshAndroid();
      return;
    }

    // Apple HealthKit is iOS only. expo-health-kit needs a development build.
    if (Platform.OS !== 'ios') {
      setReady(true);
      return;
    }

    const health = new ExpoHealthKit();
    try {
      await health.configure({
        selectedDataTypes: DATA_TYPES,
        exportFormat: 'json',
      });

      if (!(await health.isHealthKitAvailable())) {
        setReady(true);
        return;
      }

      await health.requestAuthorization(DATA_TYPES);

      const end = new Date();
      const start = new Date(end.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);

      const stepsRaw: any[] = await health.queryHealthData(
        HealthKitDataType.STEPS,
        start,
        end,
        { ascending: true },
      );
      const workoutRaw: any[] = await health.queryHealthData(
        HealthKitDataType.WORKOUT,
        start,
        end,
        { ascending: true },
      );
      const heartRateRaw: any[] = await health.queryHealthData(
        HealthKitDataType.HEART_RATE,
        start,
        end,
        { ascending: true },
      );

      const steps = stepsRaw.reduce((sum: number, s: any) => sum + (s.value ?? 0), 0);
      const workouts = workoutRaw.length;
      const avgHeartRate =
        heartRateRaw.length > 0
          ? heartRateRaw.reduce((sum: number, s: any) => sum + (s.value ?? 0), 0) /
            heartRateRaw.length
          : null;

      const allSamples: HealthSample[] = [stepsRaw, workoutRaw, heartRateRaw]
        .flat()
        .map((s) => ({
          timestamp: new Date(s.startDate).getTime(),
          value: s.value ?? 0,
          unit: s.unit ?? '',
        }));

      setSamples(allSamples);
      setSummary({ steps, workouts, avgHeartRate });
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to read HealthKit data');
    } finally {
      setReady(true);
    }
  }, [refreshAndroid]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { samples, summary, ready, error, refresh };
}