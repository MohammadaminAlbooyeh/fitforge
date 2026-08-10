import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { ExpoHealthKit } from 'expo-health-kit/build/runtime';
import { HealthKitDataType } from 'expo-health-kit/build/types';

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

export function useHealthSync(): HealthSyncState {
  const [samples, setSamples] = useState<HealthSample[]>([]);
  const [summary, setSummary] = useState<HealthSummary>({
    steps: 0,
    workouts: 0,
    avgHeartRate: null,
  });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { samples, summary, ready, error, refresh };
}