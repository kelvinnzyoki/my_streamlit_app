'use client';

import { useEffect, useState } from 'react';
import { getProgress } from '@/lib/api';

export type Period = '7d' | '30d' | '90d';

export function useProgress() {
  const [period, setPeriod] = useState<Period>('7d');
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getProgress(period)
      .then((data) => active && setProgress(data || null))
      .catch(() => active && setProgress({ summary: {}, weekly: [], calories: [] }))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [period]);

  return { progress, loading, period, setPeriod };
}
