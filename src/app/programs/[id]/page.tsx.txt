'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, CheckCircle2, Play, RotateCcw } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import { ProgramsAPI, getProgramById, getWorkouts } from '@/lib/api';
import { imageUrl } from '@/lib/utils';
import type { Program } from '@/types/program';
import type { Workout } from '@/types/workout';

type ServerProgram = Program & { weeks?: any[]; raw?: any };

function flattenProgramExercises(program: ServerProgram, workouts: Workout[]) {
  if (Array.isArray(program.weeks) && program.weeks.length) {
    return program.weeks.flatMap((week: any) =>
      (week.days || []).flatMap((day: any) =>
        (day.exercises || []).map((item: any) => {
          const lib = item.exercise;
          const match = workouts.find((w) => w.id === item.exerciseId || w.id === lib?.id);
          return {
            id: item.exerciseId || lib?.id || item.id,
            dayName: day.name || `Day ${day.dayNumber || ''}`.trim(),
            weekName: week.name || `Week ${week.weekNumber || ''}`.trim(),
            name: lib?.name || match?.name || item.exerciseName || 'Program Exercise',
            category: lib?.category || match?.category || 'Program',
            duration: match?.duration || 10,
            calories: match?.calories || 80,
            sets: item.sets,
            reps: item.reps,
            restSeconds: item.restSeconds,
            notes: item.notes,
          };
        }),
      ),
    );
  }

  return (program.workouts || []).map((wid) => {
    const match = workouts.find((w) => w.id === wid || w.slug === wid);
    return match ? { ...match, dayName: '', weekName: '' } : null;
  }).filter(Boolean) as any[];
}

export default function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [program, setProgram] = useState<ServerProgram | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let active = true;
    Promise.all([getProgramById(id), getWorkouts({ limit: 100 })])
      .then(([programData, workoutData]) => {
        if (!active) return;
        setProgram(programData as ServerProgram);
        setWorkouts(Array.isArray(workoutData) ? workoutData : []);
      })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Could not load program'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const programExercises = useMemo(() => program ? flattenProgramExercises(program, workouts) : [], [program, workouts]);
  const firstExercise = programExercises[0];

  async function enroll(restart = false) {
    if (!program) return;
    setMessage(''); setError(''); setEnrolling(true);
    try {
      await (restart ? ProgramsAPI.restartProgram(program.id) : ProgramsAPI.enrollInProgram(program.id));
      setMessage(restart ? 'Program restarted successfully.' : 'You are enrolled in this program.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not enroll in this program.');
    } finally { setEnrolling(false); }
  }

  if (loading) return <DashboardShell><section className="page-section"><p className="muted">Loading program…</p></section></DashboardShell>;
  if (!program) return <DashboardShell><section className="page-section"><p className="muted">Program not found.</p><Link href="/programs" className="secondary-btn" style={{ marginTop: '1rem' }}>Back to Programs</Link></section></DashboardShell>;

  return (
    <DashboardShell>
      <section className="page-section program-detail-page">
        <Link href="/programs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--t2)', marginBottom: '1.25rem' }}><ArrowLeft size={15} /> Back to Programs</Link>
        {message && <div className="success-alert">{message}</div>}
        {error && <div className="alert">{error}</div>}

        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          <article className="premium-card program-hero-card">
            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
              <img src={imageUrl(program.image)} alt={program.title} className="hero-img" style={{ height: 300 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 30%,rgba(7,6,12,0.85))', borderRadius: 18, display: 'flex', alignItems: 'flex-end', padding: '1rem' }}>
                <span className="badge">{program.level}</span>
              </div>
            </div>
            <p className="eyebrow">{program.focus || program.level}</p>
            <h1 style={{ marginBottom: '0.75rem' }}>{program.title}</h1>
            <p className="muted">{program.description}</p>
            <div className="metric-row">
              <span><CalendarDays size={14} /> {program.duration}</span>
              <span><CheckCircle2 size={14} /> {programExercises.length} exercises</span>
            </div>
            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button className="primary-btn" onClick={() => enroll(false)} disabled={enrolling}>{enrolling ? 'Saving…' : 'Enroll in Program'}</button>
              <button className="secondary-btn" onClick={() => enroll(true)} disabled={enrolling}><RotateCcw size={15} /> Restart Program</button>
              {firstExercise?.id && <Link className="secondary-btn" href={`/workouts/session?id=${firstExercise.id}`}><Play size={15} /> Start First Exercise</Link>}
            </div>
          </article>

          <article className="premium-card">
            <h2 style={{ marginBottom: '1.25rem' }}>Program Workouts <span style={{ color: 'var(--t2)', fontSize: '0.9rem' }}>{programExercises.length}</span></h2>
            {programExercises.length === 0 ? <p className="muted">Workouts will appear here once the server returns weeks, days, and exercises.</p> : (
              <div>
                {programExercises.map((exercise: any, index: number) => (
                  <Link key={`${exercise.id}-${index}`} href={`/workouts/session?id=${exercise.id}`} className="mini-link">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                      <span style={{ fontFamily: 'var(--f-mono)', color: 'var(--Au)', fontWeight: 700, width: 24 }}>{String(index + 1).padStart(2, '0')}</span>
                      <div style={{ minWidth: 0 }}>
                        <strong>{exercise.name}</strong>
                        <p className="muted" style={{ margin: 0, fontSize: '0.75rem' }}>{exercise.weekName} {exercise.dayName ? `· ${exercise.dayName}` : ''} · {exercise.category}</p>
                        {exercise.sets || exercise.reps ? <p className="muted" style={{ margin: 0, fontSize: '0.72rem' }}>{exercise.sets ? `${exercise.sets} sets` : ''} {exercise.reps ? `· ${exercise.reps} reps` : ''}</p> : null}
                      </div>
                    </div>
                    <span style={{ color: 'var(--Au)', fontSize: '0.8rem' }}>{exercise.duration} min</span>
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
