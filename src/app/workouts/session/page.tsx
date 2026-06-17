'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BarChart3, Check, Dumbbell, ExternalLink, LayoutDashboard, ListChecks, Pause, Play, Plus, RotateCcw } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import { getWorkoutById, logWorkout } from '@/lib/api';
import { formatTime, imageUrl } from '@/lib/utils';
import type { Workout } from '@/types/workout';

type SetRow = { reps: string; load: string; done: boolean };

function numberParam(value: string | null): number | undefined {
  if (value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function SessionContent() {
  const params = useSearchParams();
  const router = useRouter();

  const id = params.get('id') || params.get('guide') || 'pushups';
  const guide = params.get('guide') || id;
  const programId = params.get('programId') || params.get('program') || '';
  const enrollmentId = params.get('enrollmentId') || params.get('enrollment') || '';
  const returnUrl = params.get('returnUrl') || (programId ? `/programs/${encodeURIComponent(programId)}${enrollmentId ? `?enrollmentId=${encodeURIComponent(enrollmentId)}&logged=1` : '?logged=1'}` : '/progress');

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loadingWorkout, setLoadingWorkout] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sets, setSets] = useState<SetRow[]>([{ reps: '', load: '', done: false }]);
  const [notes, setNotes] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Moderate' | 'Hard'>('Moderate');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getWorkoutById(guide)
      .then((found) => {
        if (!active) return;
        if (found) {
          setWorkout(found);
          return;
        }
        setWorkout({
          id: guide,
          slug: guide,
          name: params.get('name') || 'Program Workout',
          category: params.get('category') || 'Program',
          description: 'Workout from your FlowFit program.',
          image: 'fit.webp',
          duration: 10,
          calories: 80,
          level: 'Program',
          difficulty: 'Program',
          muscles: [],
          instructions: [],
        } as Workout);
      })
      .catch(() => {
        if (!active) return;
        setWorkout({
          id: guide,
          slug: guide,
          name: params.get('name') || 'Program Workout',
          category: params.get('category') || 'Program',
          description: 'Workout from your FlowFit program.',
          image: 'fit.webp',
          duration: 10,
          calories: 80,
          level: 'Program',
          difficulty: 'Program',
          muscles: [],
          instructions: [],
        } as Workout);
      })
      .finally(() => {
        if (active) setLoadingWorkout(false);
      });

    return () => {
      active = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [guide, params]);

  function toggleTimer() {
    if (running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else {
      intervalRef.current = setInterval(() => setSeconds((current) => current + 1), 1000);
    }
    setRunning((current) => !current);
  }

  function resetTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
    setSeconds(0);
  }

  function addSet() {
    setSets((previous) => [...previous, { reps: '', load: '', done: false }]);
  }

  function updateSet(index: number, field: keyof SetRow, value: string | boolean) {
    setSets((previous) => previous.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function removeSet(index: number) {
    setSets((previous) => previous.filter((_, i) => i !== index));
  }

  const liveCalories = workout ? Math.max(0, Math.round((workout.calories / Math.max(workout.duration, 1) / 60) * seconds)) : 0;
  const displayCalories = liveCalories || Math.max(1, Number(params.get('cal') || workout?.calories || 80));

  async function handleLog() {
    if (!workout) return;

    setSaving(true);
    setError('');

    try {
      await logWorkout({
        workoutId: workout.id,
        exerciseId: workout.id,
        workoutSlug: workout.slug || workout.id,
        id: workout.id,
        name: workout.name,
        category: workout.category,
        duration: Math.max(Math.round(seconds / 60), Number(params.get('duration') || workout.duration || 1), 1),
        caloriesBurned: displayCalories,
        calories: displayCalories,
        difficulty,
        notes,
        sets: sets.filter((row) => row.reps || row.done),
        programId: programId || undefined,
        enrollmentId: enrollmentId || undefined,
        dayIndex: numberParam(params.get('dayIndex')),
        exerciseIndex: numberParam(params.get('exerciseIndex') || params.get('exIndex')),
        dayExerciseCount: numberParam(params.get('dayExerciseCount')),
        currentWeek: numberParam(params.get('currentWeek')),
        currentDay: numberParam(params.get('currentDay')),
        nextWeek: numberParam(params.get('nextWeek')),
        nextDay: numberParam(params.get('nextDay')),
      });

      setSaved(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setRunning(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not log workout.');
    } finally {
      setSaving(false);
    }
  }

  if (loadingWorkout) {
    return <DashboardShell><section className="page-section"><p className="muted">Loading session…</p></section></DashboardShell>;
  }

  if (!workout) {
    return <DashboardShell><section className="page-section"><p className="muted">Workout not found.</p></section></DashboardShell>;
  }

  const ytQuery = encodeURIComponent(`${workout.name} exercise tutorial`);

  return (
    <DashboardShell>
      <section className="page-section">
        <div className="session-hero">
          <img src={imageUrl(workout.altImage || workout.image)} alt={workout.name} />
          <div className="session-hero-overlay" />
          <div className="session-hero-content">
            <div className="badge-row">
              <span className="badge badge-cat">{workout.category}</span>
              {programId && <span className="badge">Program Session</span>}
            </div>
            <h1 style={{ margin: '0 0 0.5rem', color: '#fff' }}>{workout.name}</h1>
            <p className="muted" style={{ color: 'rgba(255,255,255,0.82)' }}>{params.get('day') || 'Workout Session'}</p>
          </div>
        </div>

        {error && <div className="alert">{error}</div>}
        {saved && <div className="success-alert">Workout logged successfully. Choose where to go next.</div>}

        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          <div>
            <div className="timer-card">
              <p className="timer-label">Session Timer</p>
              <div className={`timer-display ${running ? 'running' : ''}`}>{formatTime(seconds)}</div>
              <div className="timer-controls">
                <button className="timer-btn timer-btn-start" onClick={toggleTimer} disabled={saving || saved}>
                  {running ? <><Pause size={18} /> Pause</> : <><Play size={18} /> {seconds > 0 ? 'Resume' : 'Start'}</>}
                </button>
                <button className="timer-btn timer-btn-reset" onClick={resetTimer} disabled={saving || saved}><RotateCcw size={16} /></button>
              </div>
              <div className="live-cals">
                <span className="live-cals-label">Calories</span>
                <span className="live-cals-value">{displayCalories} kcal</span>
              </div>
            </div>

            <div className="sets-card">
              <div className="sets-header">
                <div>
                  <p className="sets-title">PERFORMANCE TRACKER</p>
                  <p className="sets-subtitle">Log sets and reps, then save to continue the program.</p>
                </div>
                <button className="sets-add-btn" onClick={addSet} disabled={saving || saved}><Plus size={14} /> Add Set</button>
              </div>

              <div className="sets-table-head"><span>#</span><span>Reps</span><span>Load</span><span>✓</span><span /></div>
              {sets.map((row, index) => (
                <div className="set-row" key={index}>
                  <span className="set-num">{index + 1}</span>
                  <input className="set-input" type="number" min="0" value={row.reps} onChange={(e) => updateSet(index, 'reps', e.target.value)} />
                  <input className="set-input" type="number" min="0" step="0.5" value={row.load} placeholder="BW" onChange={(e) => updateSet(index, 'load', e.target.value)} />
                  <button className={`set-done-btn ${row.done ? 'done' : ''}`} onClick={() => updateSet(index, 'done', !row.done)}><Check size={12} /></button>
                  <button className="set-del-btn" disabled={sets.length === 1} onClick={() => removeSet(index)}>×</button>
                </div>
              ))}
            </div>

            <div className="premium-card">
              <h2 style={{ marginBottom: '1rem' }}>Save Workout</h2>
              <div className="field">
                <label>Difficulty</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(['Easy', 'Moderate', 'Hard'] as const).map((item) => (
                    <button key={item} className={difficulty === item ? 'primary-btn' : 'secondary-btn'} style={{ flex: 1 }} onClick={() => setDifficulty(item)} disabled={saving || saved}>{item}</button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>Notes</label>
                <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How did it go?" />
              </div>
              <button className="primary-btn" style={{ width: '100%' }} onClick={handleLog} disabled={saving || saved}>
                {saving ? 'Saving…' : saved ? 'Saved' : 'Save Workout'}
              </button>

              {saved && (
                <div className="session-complete-actions" aria-label="Workout completion navigation options">
                  {programId && (
                    <Link href={returnUrl} className="session-complete-card primary">
                      <ListChecks size={18} />
                      <span>Continue Program</span>
                      <small>Return to today’s remaining workouts</small>
                    </Link>
                  )}
                  <Link href="/progress" className="session-complete-card">
                    <BarChart3 size={18} />
                    <span>View Progress</span>
                    <small>Check your stats and history</small>
                  </Link>
                  <Link href="/workouts" className="session-complete-card">
                    <Dumbbell size={18} />
                    <span>More Workouts</span>
                    <small>Start another quick session</small>
                  </Link>
                  <Link href="/dashboard" className="session-complete-card">
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                    <small>Return to your control centre</small>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="premium-card" style={{ marginBottom: '1.25rem' }}>
              <p className="eyebrow">About this exercise</p>
              <p className="muted">{workout.description}</p>
              <div className="pill-row">
                {(workout.muscles || []).map((muscle) => <span className="pill" key={muscle}>{muscle}</span>)}
              </div>
            </div>

            {workout.instructions?.length ? (
              <div className="premium-card" style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Instructions</h2>
                {workout.instructions.map((step, index) => <div key={`${step}-${index}`} className="mini-link"><strong>{index + 1}</strong><span>{step}</span></div>)}
              </div>
            ) : null}

            <div className="premium-card">
              <h2 style={{ marginBottom: '0.75rem' }}>Tutorial Video</h2>
              <a href={`https://www.youtube.com/results?search_query=${ytQuery}`} target="_blank" rel="noopener noreferrer" className="secondary-btn" style={{ width: '100%' }}>
                <ExternalLink size={15} /> Watch on YouTube
              </a>
            </div>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}

export default function WorkoutSessionPage() {
  return (
    <Suspense fallback={<DashboardShell><section className="page-section"><p className="muted">Loading session…</p></section></DashboardShell>}>
      <SessionContent />
    </Suspense>
  );
}
