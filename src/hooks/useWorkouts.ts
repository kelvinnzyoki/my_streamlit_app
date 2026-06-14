'use client';

import { useEffect, useMemo, useState } from 'react';
import { getWorkouts } from '@/lib/api';
import type { Workout } from '@/types/workout';

const DEFAULT_TABS = ['All', 'Strength', 'Cardio', 'Core', 'HIIT', 'Mobility', 'Recovery', 'General'];

export function useWorkouts() {
  const [all, setAll] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    let active = true;
    setLoading(true);
    getWorkouts({ limit: 100 })
      .then((data) => { if (active) setAll(Array.isArray(data) ? data : []); })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Could not load workouts'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const categories = useMemo(() => {
    const fromData = [...new Set(all.map((w) => w.category).filter(Boolean))];
    const merged = DEFAULT_TABS.filter((tab) => tab === 'All' || fromData.includes(tab));
    fromData.forEach((cat) => { if (!merged.includes(cat)) merged.push(cat); });
    return merged;
  }, [all]);

  const workouts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((workout) => {
      const matchesQuery = !q ||
        workout.name.toLowerCase().includes(q) ||
        workout.description.toLowerCase().includes(q) ||
        workout.category.toLowerCase().includes(q) ||
        (workout.muscles || []).some((m) => m.toLowerCase().includes(q));
      const matchesCategory = category === 'All' || workout.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [all, query, category]);

  return { workouts, allWorkouts: all, categories, query, setQuery, category, setCategory, loading, error };
}
