'use client';

import { useEffect, useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import ProgramCard from '@/components/programCard';
import { getPrograms } from '@/lib/api';
import type { Program } from '@/types/program';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getPrograms({ limit: 100 })
      .then((data) => { if (active) setPrograms(Array.isArray(data) ? data : []); })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Could not load programs'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const levels = useMemo(() => {
    const unique = [...new Set(programs.map((p) => p.level).filter(Boolean))];
    return ['All', ...unique];
  }, [programs]);

  const filtered = filter === 'All' ? programs : programs.filter((p) => p.level === filter);

  return (
    <DashboardShell>
      <section className="page-section programs-page">
        <div className="compact-hero premium-card">
          <div>
            <p className="eyebrow">Programs</p>
            <h1>Structured Training Plans</h1>
            <p className="muted" style={{ maxWidth: 760 }}>
              Server-backed FlowFit programs with enrollment, AI program support, quota protection, and local fallback when the API is offline.
            </p>
          </div>
          <div className="pill-row"><span className="pill"><Sparkles size={14} /> {programs.length} plans</span></div>
        </div>

        <div className="filter-tabs" style={{ marginTop: '1.5rem' }}>
          {levels.map((level) => (
            <button key={level} className={`tab-btn ${filter === level ? 'active' : ''}`} onClick={() => setFilter(level)}>
              {level}
            </button>
          ))}
        </div>

        {error && <div className="alert">{error}</div>}

        {loading ? (
          <div className="grid grid-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="premium-card" style={{ height: 340, opacity: 0.35 }} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="premium-card" style={{ textAlign: 'center', padding: '3rem' }}><p className="muted">No programs found.</p></div>
        ) : (
          <div className="grid grid-3">{filtered.map((program) => <ProgramCard key={program.id} program={program} />)}</div>
        )}
      </section>
    </DashboardShell>
  );
}
