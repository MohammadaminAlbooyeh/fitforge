import { useCallback, useEffect, useState } from 'react';

import { listWorkouts } from '@/api/workouts';
import { Workout } from '@/api/types';

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listWorkouts();
      setWorkouts(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load workouts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { workouts, loading, error, refresh };
}