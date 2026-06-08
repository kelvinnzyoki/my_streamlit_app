'use client';
import { useEffect, useState } from 'react';
import { getProgress } from '@/lib/api';

export function useProgress() {
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getProgress().then(setProgress).finally(() => setLoading(false));
  }, []);
  return { progress, loading };
}
