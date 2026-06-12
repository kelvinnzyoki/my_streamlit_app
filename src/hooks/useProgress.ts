'use client';

import { useState, useEffect } from 'react';
import { getProgress } from '@/lib/api';

export type Period = '7d' | '30d' | '90d';

export function useProgress() {
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('7d');

  useEffect(() => {
    setLoading(true);
    getProgress(period)
      .then(setProgress)
      .catch(() => setProgress(null))
      .finally(() => setLoading(false));
  }, [period]);

  return { progress, loading, period, setPeriod };
}
