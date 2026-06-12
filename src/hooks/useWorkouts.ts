'use client';

import { useState, useEffect, useMemo } from 'react';
import { getWorkouts } from '@/lib/api';
import { fallbackWorkouts } from '@/lib/fallback';
import type { Workout } from '@/types/workout';

const TABS = ['All', 'Strength', 'Cardio', 'Core', 'HIIT', 'Mobility', 'Recovery'] as const;

export function useWorkouts() {
  const [all, setAll] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    getWorkouts()
      .then((data) => setAll(data.length ? data : fallbackWorkouts))
      .catch(() => setAll(fallbackWorkouts))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const fromData = [...new Set(all.map((w) => w.category))];
    const merged = TABS.filter((t) => t === 'All' || fromData.includes(t));
    // add any extra categories from data not in tabs
    fromData.forEach((c) => { if (!merged.includes(c as typeof TABS[number])) merged.push(c as typeof TABS[number]); });
    return merged as string[];
  }, [all]);

  const workouts = useMemo(() => {
    const q = query.toLowerCase();
    return all.filter((w) => {
      const matchQ = !q || w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q);
      const matchC = category === 'All' || w.category === category;
      return matchQ && matchC;
    });
  }, [all, query, category]);

  return { workouts, categories, query, setQuery, category, setCategory, loading };
}
