'use client';

import { useEffect, useMemo, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import ProgramCard from '@/components/programCard';
import { getPrograms } from '@/lib/api';
import type { Program } from '@/types/program';

type ProgramLike = Program & {
  name?: string;
  title?: string;
  slug?: string;
  workoutIds?: string[];
};

function normalizeProgram(program: ProgramLike): ProgramLike {
  return {
    ...program,
    id: String(program.id || program.slug || program.title || program.name || crypto.randomUUID()),
    title: program.title || program.name || 'Untitled Program',
    level: program.level || 'All Levels',
    description: program.description || 'Structured FlowFit training plan for home workouts.',
    duration: program.duration || 'Flexible',
    image: program.image || '/images/fit.webp',
    workouts: Array.isArray(program.workouts)
      ? program.workouts
      : Array.isArray(program.workoutIds)
        ? program.workoutIds
        : [],
  };
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<ProgramLike[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    getPrograms()
      .then((items) => setPrograms(Array.isArray(items) ? items.map((p) => normalizeProgram(p as ProgramLike)) : []))
      .catch(() => setPrograms([]))
      .finally(() => setLoading(false));
  }, []);

  const levels = useMemo(() => ['All', ...Array.from(new Set(programs.map((p) => p.level || 'All Levels')))], [programs]);
  const filtered = filter === 'All' ? programs : programs.filter((p) => (p.level || 'All Levels') === filter);

  return (
    <DashboardShell>
      <section className="page-section programs-page">
        <div className="dashboard-hero compact-hero">
          <div>
            <p className="eyebrow">Programs</p>
            <h1>Structured Training Plans</h1>
            <p className="muted" style={{ maxWidth: 620 }}>
              Multi-week programs designed around consistency, fat loss, core strength, mobility, and advanced performance.
            </p>
          </div>
        </div>

        <div className="filter-tabs">
          {levels.map((level) => (
            <button
              key={level}
              className={`tab-btn ${filter === level ? 'active' : ''}`}
              onClick={() => setFilter(level)}
              type="button"
            >
              {level}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="premium-card" style={{ height: 340, opacity: 0.35 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="premium-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p className="muted">No programs found.</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {filtered.map((program) => <ProgramCard key={program.id} program={program as Program} />)}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
