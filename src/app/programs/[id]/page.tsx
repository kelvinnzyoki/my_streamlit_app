'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Dumbbell, Target } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import { getProgramById, getPrograms, getWorkouts } from '@/lib/api';
import { imageUrl } from '@/lib/utils';
import type { Workout } from '@/types/workout';

type ProgramLike = {
  id?: string;
  slug?: string;
  name?: string;
  title?: string;
  level?: string;
  description?: string;
  duration?: string | number;
  focus?: string;
  image?: string;
  workouts?: string[] | Workout[];
  workoutIds?: string[];
};

type WorkoutLike = {
  id?: string;
  slug?: string;
  name?: string;
  title?: string;
  category?: string;
  level?: string;
  difficulty?: string;
  duration?: number;
  calories?: number;
};

function normalizeProgram(program: ProgramLike | null | undefined, fallbackId = 'program'): ProgramLike | null {
  if (!program) return null;
  const safeId = String(program.id || program.slug || fallbackId);
  return {
    ...program,
    id: safeId,
    slug: program.slug || safeId,
    title: program.title || program.name || 'FlowFit Program',
    level: program.level || 'All Levels',
    description: program.description || 'Structured FlowFit training plan for consistent home workouts.',
    duration: program.duration || 'Flexible',
    image: program.image || '/images/fit.webp',
    workouts: Array.isArray(program.workouts)
      ? program.workouts
      : Array.isArray(program.workoutIds)
        ? program.workoutIds
        : [],
  };
}

function workoutKey(item: unknown): string {
  if (typeof item === 'string') return item;
  if (item && typeof item === 'object') {
    const maybe = item as WorkoutLike;
    return String(maybe.slug || maybe.id || maybe.name || maybe.title || '');
  }
  return '';
}

function normalizeWorkout(workout: WorkoutLike): WorkoutLike {
  return {
    ...workout,
    id: String(workout.id || workout.slug || workout.name || 'workout'),
    slug: workout.slug || workout.id || workout.name || 'workout',
    name: workout.name || workout.title || 'Workout Session',
    category: workout.category || 'Training',
    level: workout.level || workout.difficulty || 'All Levels',
    duration: Number(workout.duration || 20),
    calories: Number(workout.calories || 120),
  };
}

export default function ProgramDetailPage() {
  const params = useParams<{ id?: string | string[] }>();
  const routeId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const id = decodeURIComponent(routeId || '');

  const [program, setProgram] = useState<ProgramLike | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutLike[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    if (!id) {
      setLoading(false);
      return;
    }

    async function loadProgram() {
      setLoading(true);
      try {
        const [programResult, allProgramsResult, workoutsResult] = await Promise.allSettled([
          getProgramById(id),
          getPrograms(),
          getWorkouts(),
        ]);

        if (!alive) return;

        const directProgram = programResult.status === 'fulfilled'
          ? normalizeProgram(programResult.value as ProgramLike, id)
          : null;

        const allPrograms = allProgramsResult.status === 'fulfilled' && Array.isArray(allProgramsResult.value)
          ? allProgramsResult.value.map((p) => normalizeProgram(p as ProgramLike, id)).filter(Boolean) as ProgramLike[]
          : [];

        const matchedProgram = directProgram || allPrograms.find((p) =>
          String(p.id) === id || String(p.slug) === id || String(p.title || '').toLowerCase().replace(/\s+/g, '-') === id
        ) || null;

        const safeWorkouts = workoutsResult.status === 'fulfilled' && Array.isArray(workoutsResult.value)
          ? workoutsResult.value.map((w) => normalizeWorkout(w as WorkoutLike))
          : [];

        setProgram(matchedProgram);
        setWorkouts(safeWorkouts);
      } catch {
        if (alive) {
          setProgram(null);
          setWorkouts([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadProgram();
    return () => { alive = false; };
  }, [id]);

  const programWorkouts = useMemo(() => {
    const raw = Array.isArray(program?.workouts) ? program.workouts : [];
    const keys = raw.map(workoutKey).filter(Boolean);

    if (!keys.length) return [];

    return keys.reduce<WorkoutLike[]>((acc, key) => {
      const match = workouts.find((w) =>
        String(w.id) === key || String(w.slug) === key || String(w.name).toLowerCase().replace(/\s+/g, '-') === key
      );

      if (match) acc.push(match);
      else acc.push(normalizeWorkout({ id: key, slug: key, name: key.replace(/-/g, ' ') }));
      return acc;
    }, []);
  }, [program, workouts]);

  if (loading) {
    return (
      <DashboardShell>
        <section className="page-section">
          <div className="premium-card" style={{ padding: '2rem' }}>
            <p className="muted">Loading program…</p>
          </div>
        </section>
      </DashboardShell>
    );
  }

  if (!program) {
    return (
      <DashboardShell>
        <section className="page-section">
          <div className="premium-card" style={{ padding: '2rem' }}>
            <p className="eyebrow">Program</p>
            <h1>Program Not Found</h1>
            <p className="muted">This program could not be loaded. It may have been removed or the backend returned incomplete data.</p>
            <Link href="/programs" className="secondary-btn" style={{ marginTop: '1rem', display: 'inline-flex' }}>
              <ArrowLeft size={15} /> Back to Programs
            </Link>
          </div>
        </section>
      </DashboardShell>
    );
  }

  const title = program.title || program.name || 'FlowFit Program';
  const firstWorkout = programWorkouts[0];

  return (
    <DashboardShell>
      <section className="page-section program-detail-page">
        <Link href="/programs" className="mini-link" style={{ width: 'fit-content', marginBottom: '1rem' }}>
          <ArrowLeft size={14} /> Back to Programs
        </Link>

        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          <article className="premium-card program-detail-hero">
            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
              <img
                src={imageUrl(program.image || '/images/fit.webp')}
                alt={title}
                className="hero-img"
                style={{ height: 270 }}
              />
              <div style={{ position: 'absolute', inset: 0, borderRadius: 18, background: 'linear-gradient(180deg, transparent 35%, rgba(7,6,12,0.84))', display: 'flex', alignItems: 'flex-end', padding: '1rem' }}>
                <span className="badge">{program.level || 'All Levels'}</span>
              </div>
            </div>

            <p className="eyebrow">{program.level || 'All Levels'}</p>
            <h1 style={{ marginBottom: '0.75rem' }}>{title}</h1>
            <p className="muted">{program.description}</p>

            <div className="metric-row">
              <span className="program-meta-pill"><CalendarDays size={14} /> {program.duration || 'Flexible'}</span>
              {program.focus && <span className="program-meta-pill"><Target size={14} /> {program.focus}</span>}
              <span className="program-meta-pill"><Dumbbell size={14} /> {programWorkouts.length} workouts</span>
            </div>

            <Link
              href={firstWorkout ? `/workouts/session?id=${firstWorkout.slug || firstWorkout.id}` : '/workouts'}
              className="primary-btn"
              style={{ width: '100%', marginTop: '1.25rem' }}
            >
              {firstWorkout ? 'Start Program' : 'Browse Workouts'}
            </Link>
          </article>

          <article className="premium-card artistic-panel-card">
            <div className="panel-title-row">
              <h2>Program Workouts</h2>
              <span style={{ color: 'var(--Au)', fontFamily: 'var(--f-mono)' }}>{programWorkouts.length}</span>
            </div>

            {programWorkouts.length === 0 ? (
              <p className="muted">No workouts are attached to this program yet. You can still browse the workout library.</p>
            ) : (
              <div>
                {programWorkouts.map((workout, index) => (
                  <Link
                    key={`${workout.id}-${index}`}
                    href={`/workouts/session?id=${workout.slug || workout.id}`}
                    className="mini-link program-workout-row"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                      <span style={{ fontFamily: 'var(--f-mono)', color: 'var(--Au)', fontWeight: 700, width: 25, flexShrink: 0 }}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ display: 'block', textTransform: 'capitalize' }}>{workout.name}</strong>
                        <p className="muted" style={{ margin: 0, fontSize: '0.75rem' }}>{workout.category} · {workout.level}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ color: 'var(--Au)', fontSize: '0.78rem' }}>{workout.duration} min</span>
                      <p className="muted" style={{ margin: 0, fontSize: '0.72rem' }}>{workout.calories} kcal</p>
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
