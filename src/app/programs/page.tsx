'use client';

import { useEffect, useMemo, useState } from 'react';
import { Filter, Sparkles } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import ProgramCard from '@/components/programCard';
import { getPrograms } from '@/lib/api';
import type { Program } from '@/types/program';
import Footer from '@/components/footer';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<(Program & any)[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getPrograms({ limit: 100 })
      .then((data) => {
        if (!active) return;
        setPrograms(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Could not load programs');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const levels = useMemo(() => {
    const unique = [...new Set(programs.map((p) => p.level || p.difficulty).filter(Boolean))];
    return ['All', ...unique];
  }, [programs]);

  const categories = useMemo(() => {
    const unique = [...new Set(programs.map((p) => p.focus || p.category).filter(Boolean))];
    return ['All', ...unique];
  }, [programs]);

  const filtered = programs.filter((program) => {
    const levelMatch = levelFilter === 'All' || (program.level || program.difficulty) === levelFilter;
    const categoryMatch = categoryFilter === 'All' || (program.focus || program.category) === categoryFilter;
    return levelMatch && categoryMatch;
  });

  const totalExercises = programs.reduce((sum, p: any) => sum + Number(p.totalExercises || 0), 0);
  const totalDays = programs.reduce((sum, p: any) => sum + Number(p.totalDays || 0), 0);

  return (
    <DashboardShell>
      <section className="page-section programs-page">
        <div className="compact-hero premium-card">
          <div>
            <p className="eyebrow">Programs</p>
            <h1>Structured Training Plans</h1>
            <p className="muted" style={{ maxWidth: 760 }}>
              Server-backed FlowFit programs. Public seed plans, your AI plans, saved weeks, days and exercises are normalized before display.
            </p>
          </div>
          <div className="pill-row">
            <span className="pill"><Sparkles size={14} /> {programs.length} plans</span>
            <span className="pill">{totalDays} days</span>
            <span className="pill">{totalExercises} exercises</span>
          </div>
        </div>

        <div className="premium-card" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <Filter size={16} style={{ color: 'var(--Au)' }} />
            <strong>Filter Programs</strong>
          </div>

          <p className="muted" style={{ margin: '0 0 0.5rem', fontSize: '0.8rem' }}>Level</p>
          <div className="filter-tabs" style={{ marginBottom: '1rem' }}>
            {levels.map((level) => (
              <button key={level} className={`tab-btn ${levelFilter === level ? 'active' : ''}`} onClick={() => setLevelFilter(level)}>
                {level}
              </button>
            ))}
          </div>

          <p className="muted" style={{ margin: '0 0 0.5rem', fontSize: '0.8rem' }}>Focus</p>
          <div className="filter-tabs" style={{ marginBottom: 0 }}>
            {categories.map((category) => (
              <button key={category} className={`tab-btn ${categoryFilter === category ? 'active' : ''}`} onClick={() => setCategoryFilter(category)}>
                {category}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="alert">{error}</div>}

        {loading ? (
          <div className="grid grid-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="premium-card" style={{ height: 340, opacity: 0.35 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="premium-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p className="muted">No programs match your filters.</p>
            <button className="secondary-btn" style={{ marginTop: '1rem' }} onClick={() => { setLevelFilter('All'); setCategoryFilter('All'); }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-3">
            {filtered.map((program) => <ProgramCard key={program.id} program={program} />)}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
