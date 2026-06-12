'use client';

import { useEffect, useMemo, useState } from 'react';
import { getWorkouts } from '@/lib/api';

export function useWorkouts() {
  const [all, setAll] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState<'server' | 'fallback'>('server');

  useEffect(() => {
    let active = true;
    setLoading(true);
    getWorkouts()
      .then((items) => {
        if (!active) return;
        setAll(Array.isArray(items) ? items : []);
        setServerStatus('server');
      })
      .catch(() => {
        if (!active) return;
        setAll([]);
        setServerStatus('fallback');
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const categories = useMemo(() => ['All', ...Array.from(new Set(all.map((w) => w.category).filter(Boolean)))], [all]);
  const workouts = useMemo(() => all.filter((w) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || [w.name, w.description, w.category, w.level, w.difficulty].some((v) => String(v || '').toLowerCase().includes(q));
    const matchesCat = category === 'All' || w.category === category;
    return matchesQuery && matchesCat;
  }), [all, query, category]);

  return { workouts, allWorkouts: all, categories, query, setQuery, category, setCategory, loading, serverStatus };
}
