'use client';
// src/hooks/useWorkouts.ts
import { useState, useEffect } from 'react';
import type { WorkoutSession } from '@/types/workout';
import { api } from '@/lib/api';

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const data = await api.get<{ workouts: WorkoutSession[] }>('/workouts');
      setWorkouts(data.workouts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  return { workouts, loading, error, refetch: fetchWorkouts };
}
