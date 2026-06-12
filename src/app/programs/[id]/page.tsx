'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import { getProgramById, getWorkouts } from '@/lib/api';
import { imageUrl } from '@/lib/utils';
import type { Program } from '@/types/program';
import type { Workout } from '@/types/workout';

export default function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [program, setProgram] = useState<Program | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([getProgramById(id), getWorkouts()])
      .then(([p, w]) => {
        setProgram(p);
        setWorkouts(w);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <DashboardShell>
        <section className="page-section"><p className="muted">Loading program…</p></section>
      </DashboardShell>
    );
  }

  if (!program) {
    return (
      <DashboardShell>
        <section className="page-section">
          <p className="muted">Program not found.</p>
          <Link href="/programs" className="secondary-btn" style={{ marginTop: '1rem', display: 'inline-flex' }}>← Back to Programs</Link>
        </section>
      </DashboardShell>
    );
  }

  const programWorkouts: Workout[] = (program.workouts as string[]).reduce<Workout[]>((acc, wid) => {
    const match = workouts.find((w) => w.id === wid || w.slug === wid);
    if (match) acc.push(match);
    return acc;
  }, []);

  return (
    <DashboardShell>
      <section className="page-section">
        <Link href="/programs" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--t2)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
          <ArrowLeft size={14} /> Back to Programs
        </Link>

        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          {/* ── Overview card ── */}
          <article className="premium-card">
            {/* Hero image with gradient overlay */}
            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
              <img
                src={imageUrl(program.image)}
                alt={program.title}
                className="hero-img"
                style={{ height: 260 }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 40%,rgba(7,6,12,0.8))', borderRadius: 18, display: 'flex', alignItems: 'flex-end', padding: '1rem' }}>
                <span className="badge">{program.level}</span>
              </div>
            </div>

            <p className="eyebrow">{program.level}</p>
            <h1 style={{ marginBottom: '0.75rem' }}>{program.title}</h1>
            <p className="muted">{program.description}</p>

            <div className="metric-row">
              <span>📅 {program.duration}</span>
              {program.focus && <span>🎯 {program.focus}</span>}
              <span>🏋️ {program.workouts.length} workouts</span>
            </div>

            <Link
              href={`/workouts/session?id=${programWorkouts[0]?.slug || programWorkouts[0]?.id || ''}`}
              className="primary-btn"
              style={{ width: '100%', marginTop: '1.25rem' }}
            >
              Start Program
            </Link>
          </article>

          {/* ── Workout list ── */}
          <article className="premium-card">
            <h2 style={{ marginBottom: '1.25rem' }}>
              Program Workouts
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.85rem', fontWeight: 300, color: 'var(--t2)', marginLeft: '0.5rem' }}>
                {programWorkouts.length}
              </span>
            </h2>

            {programWorkouts.length === 0 ? (
              <p className="muted">Workouts will appear here once the server returns them.</p>
            ) : (
              <div>
                {programWorkouts.map((w, i) => (
                  <Link
                    key={w.id}
                    href={`/workouts/session?id=${w.slug || w.id}`}
                    className="mini-link"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontFamily: 'var(--f-mono)', color: 'var(--Au)', fontWeight: 700, fontSize: '0.82rem', width: 22, flexShrink: 0 }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <strong style={{ fontSize: '0.9rem' }}>{w.name}</strong>
                        <p className="muted" style={{ margin: 0, fontSize: '0.75rem' }}>{w.category} · {w.level}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--Au)' }}>{w.duration} min</span>
                      <p className="muted" style={{ margin: 0, fontSize: '0.72rem' }}>{w.calories} kcal</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </article>
        </div>
      </section>
    </DashboardShell>
  );
}
