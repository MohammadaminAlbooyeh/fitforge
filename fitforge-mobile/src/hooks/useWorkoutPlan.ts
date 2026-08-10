import { useCallback, useEffect, useState } from 'react';

import { getActiveWorkoutPlan } from '@/api/workoutPlans';
import { WorkoutPlan } from '@/api/types';

export function useWorkoutPlan() {
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPlan(await getActiveWorkoutPlan());
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load plan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { plan, loading, error, reload: load };
}
