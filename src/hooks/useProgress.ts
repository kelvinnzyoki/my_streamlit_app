'use client';
// src/hooks/useProgress.ts
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface ProgressData {
  weeklyWorkouts: number[];
  totalWorkouts: number;
  streakDays: number;
  monthlyStats: { month: string; count: number }[];
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const data = await api.get<{ progress: ProgressData }>('/progress');
        setProgress(data.progress);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load progress');
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  return { progress, loading, error };
}
