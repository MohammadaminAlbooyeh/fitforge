import { useCallback, useEffect, useState } from 'react';

import { fetchDailyPlan } from '@/api/plans';
import { DailyWorkoutPlan } from '@/api/types';

export function useDailyPlan(offset = 0) {
  const [plan, setPlan] = useState<DailyWorkoutPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (dayOffset: number) => {
    setLoading(true);
    setError(null);
    try {
      setPlan(await fetchDailyPlan(dayOffset));
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load plan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(offset);
  }, [offset, load]);

  return { plan, loading, error, reload: () => load(offset) };
}