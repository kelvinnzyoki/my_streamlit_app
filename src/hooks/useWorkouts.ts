'use client';
import { useEffect, useMemo, useState } from 'react';
import { getWorkouts } from '@/lib/api';
import type { Workout } from '@/types/workout';

export function useWorkouts() {
  const [items, setItems] = useState<Workout[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWorkouts().then(setItems).finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ['All', ...Array.from(new Set(items.map((item) => item.category)))], [items]);
  const workouts = useMemo(() => items.filter((item) => {
    const matchesCategory = category === 'All' || item.category === category;
    const matchesQuery = [item.name, item.description, item.category].join(' ').toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  }), [items, category, query]);

  return { workouts, categories, query, setQuery, category, setCategory, loading };
}
