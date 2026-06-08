'use client';
import { useMemo, useState } from 'react';
import { workouts } from '@/data/workouts';

export function useWorkouts() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = useMemo(() => workouts.filter((item) => {
    const matchesCategory = category === 'All' || item.category === category;
    const search = `${item.name} ${item.category} ${item.level} ${item.description}`.toLowerCase();
    return matchesCategory && search.includes(query.toLowerCase());
  }), [query, category]);

  return { workouts: filtered, query, setQuery, category, setCategory };
}
