'use client';

import { useEffect, useMemo, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import ProgramCard from '@/components/programCard';
import { getPrograms } from '@/lib/api';

function normalizeProgram(p: any) {
  return {
    ...p,
    id: p?.id || p?.slug || p?.name,
    title: p?.title || p?.name || 'Untitled Program',
    name: p?.name || p?.title || 'Untitled Program',
    level: p?.level || p?.difficulty || 'intermediate',
    duration: p?.duration || (p?.durationWeeks ? `${p.durationWeeks} week${p.durationWeeks === 1 ? '' : 's'}` : 'Flexible'),
    workouts: Array.isArray(p?.workouts) ? p.workouts : [],
    image: p?.image || '/images/fit.webp',
  };
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    getPrograms()
      .then((items) => setPrograms((Array.isArray(items) ? items : []).map(normalizeProgram)))
      .catch(() => setPrograms([]))
      .finally(() => setLoading(false));
  }, []);

  const levels = useMemo(() => ['All', ...Array.from(new Set(programs.map((p) => p.level).filter(Boolean)))], [programs]);
  const filtered = filter === 'All' ? programs : programs.filter((p) => p.level === filter);

  return (
    <DashboardShell>
      <section className="page-section">
        <p className="eyebrow">Protected Programs</p>
        <h1>Structured Training Plans</h1>
        <p className="muted" style={{ marginBottom: '1.5rem', maxWidth: 620 }}>
          Programs are loaded from the FlowFit server first. If the server is offline, frontend fallback programs are used.
        </p>

        <div className="filter-tabs">
          {levels.map((l) => <button key={l} className={`tab-btn ${filter === l ? 'active' : ''}`} onClick={() => setFilter(l)}>{l}</button>)}
        </div>

        {loading ? <div className="grid grid-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="premium-card" style={{ height: 340, opacity: 0.35 }} />)}</div>
          : filtered.length === 0 ? <div className="premium-card" style={{ textAlign: 'center', padding: '3rem' }}><p className="muted">No programs found.</p></div>
          : <div className="grid grid-3">{filtered.map((p) => <ProgramCard key={p.id} program={p} />)}</div>}
      </section>
    </DashboardShell>
  );
}
