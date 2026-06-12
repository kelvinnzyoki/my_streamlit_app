'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import ProgramCard from '@/components/programCard';
import { getPrograms } from '@/lib/api';
import type { Program } from '@/types/program';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPrograms()
      .then(setPrograms)
      .catch(() => setPrograms([]))
      .finally(() => setLoading(false));
  }, []);

  const levels = ['All', ...new Set(programs.map((p) => p.level))];
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? programs : programs.filter((p) => p.level === filter);

  return (
    <DashboardShell>
      <section className="page-section">
        <p className="eyebrow">Programs</p>
        <h1>Structured Training Plans</h1>
        <p className="muted" style={{ marginBottom: '1.5rem', maxWidth: 560 }}>
          Multi-week programs designed around specific goals — from beginner consistency to advanced performance.
        </p>

        <div className="filter-tabs">
          {levels.map((l) => (
            <button
              key={l}
              className={`tab-btn ${filter === l ? 'active' : ''}`}
              onClick={() => setFilter(l)}
            >
              {l}
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
            {filtered.map((p) => <ProgramCard key={p.id} program={p} />)}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
