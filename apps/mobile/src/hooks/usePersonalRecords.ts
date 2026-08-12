import { useCallback, useEffect, useState } from 'react';

import { listPersonalRecords } from '@/api/workoutLogs';
import { PersonalRecord } from '@/api/types';

export function usePersonalRecords() {
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRecords(await listPersonalRecords());
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load personal records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { records, loading, error, reload: load };
}
