'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import { getProgramById, getWorkouts } from '@/lib/api';
import { imageUrl } from '@/lib/utils';

function normalizeProgram(p: any) {
  if (!p) return null;
  return {
    ...p,
    title: p.title || p.name || 'Untitled Program',
    name: p.name || p.title || 'Untitled Program',
    level: p.level || p.difficulty || 'intermediate',
    duration: p.duration || (p.durationWeeks ? `${p.durationWeeks} week${p.durationWeeks === 1 ? '' : 's'}` : 'Flexible'),
    workouts: Array.isArray(p.workouts) ? p.workouts : [],
    weeks: Array.isArray(p.weeks) ? p.weeks : [],
    image: p.image || '/images/fit.webp',
  };
}

export default function ProgramDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [program, setProgram] = useState<any>(null);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([getProgramById(id), getWorkouts()])
      .then(([p, w]) => {
        setProgram(normalizeProgram(p));
        setWorkouts(Array.isArray(w) ? w : []);
      })
      .catch(() => setProgram(null))
      .finally(() => setLoading(false));
  }, [id]);

  const programWorkouts = useMemo(() => {
    if (!program) return [];
    const ids = Array.isArray(program.workouts) ? program.workouts : [];
    if (ids.length) {
      return ids.map((wid: any) => workouts.find((w) => w.id === wid || w.slug === wid || w.name === wid)).filter(Boolean);
    }
    return program.weeks.flatMap((week: any) => (week.days || []).flatMap((day: any) => (day.exercises || []).map((ex: any) => ({
      id: ex.exerciseId || ex.id || ex.exerciseName,
      slug: ex.exerciseId || ex.id,
      name: ex.exercise?.name || ex.exerciseName || 'Exercise',
      category: ex.exercise?.category || program.category || 'program',
      level: program.level,
      duration: ex.restSeconds ? Math.max(Math.round(ex.restSeconds / 60), 1) : 10,
      calories: ex.exercise?.caloriesPerMin ? Math.round(ex.exercise.caloriesPerMin * 10) : 80,
    }))));
  }, [program, workouts]);

  if (loading) return <DashboardShell><section className="page-section"><p className="muted">Loading protected program…</p></section></DashboardShell>;

  if (!program) return <DashboardShell><section className="page-section"><p className="muted">Program not found.</p><Link href="/programs" className="secondary-btn" style={{ marginTop: '1rem' }}>Back to Programs</Link></section></DashboardShell>;

  return (
    <DashboardShell>
      <section className="page-section">
        <Link href="/programs" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--t2)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
          <ArrowLeft size={14} /> Back to Programs
        </Link>

        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          <article className="premium-card artistic-panel">
            <img src={imageUrl(program.image)} alt={program.title} className="hero-img" />
            <p className="eyebrow" style={{ marginTop: '1rem' }}>{program.level}</p>
            <h1 style={{ marginBottom: '0.75rem' }}>{program.title}</h1>
            <p className="muted">{program.description || 'A protected FlowFit training program loaded from your account.'}</p>
            <div className="metric-row">
              <span>📅 {program.duration}</span>
              <span>🎯 {program.focus || program.category || 'Fitness'}</span>
              <span>🏋️ {programWorkouts.length} workouts</span>
            </div>
            <Link href={`/workouts/session?id=${programWorkouts[0]?.slug || programWorkouts[0]?.id || ''}`} className="primary-btn" style={{ width: '100%', marginTop: '1.25rem' }}>
              Start Program
            </Link>
          </article>

          <article className="premium-card artistic-panel">
            <h2>Program Workouts <span style={{ color: 'var(--Au)' }}>{programWorkouts.length}</span></h2>
            {programWorkouts.length === 0 ? <p className="muted">No workouts returned by server yet.</p> : programWorkouts.map((w: any, i: number) => (
              <Link key={`${w.id || w.name}-${i}`} href={`/workouts/session?id=${w.slug || w.id || encodeURIComponent(w.name)}`} className="mini-link">
                <div>
                  <strong>{String(i + 1).padStart(2, '0')} · {w.name}</strong>
                  <p className="muted" style={{ margin: 0, fontSize: '0.75rem' }}>{w.category || 'Workout'} · {w.level || program.level}</p>
                </div>
                <span style={{ color: 'var(--Au)' }}>{w.duration || 10} min</span>
              </Link>
            ))}
          </article>
        </div>
      </section>
    </DashboardShell>
  );
}
