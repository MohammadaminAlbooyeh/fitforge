import { useEffect, useState } from 'react';

type HealthSample = {
  timestamp: number;
  value: number;
  unit: string;
};

export function useHealthSync() {
  const [samples, setSamples] = useState<HealthSample[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // TODO: integrate expo-health-kit to read workouts/steps/heart-rate
    setReady(true);
  }, []);

  return { samples, ready };
}