'use client';

import Link from 'next/link';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, ExternalLink, Pause, Play, Plus, RotateCcw, X } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import { getWorkoutById, logWorkout } from '@/lib/api';
import { formatTime, imageUrl } from '@/lib/utils';
import type { Workout } from '@/types/workout';

type SetRow = { reps: string; load: string; done: boolean };

type SessionToast = {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  actions?: Array<{ label: string; href: string; primary?: boolean }>;
};

function numberParam(value: string | null): number | undefined {
  if (value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function SessionContent() {
  const params = useSearchParams();

  const id = params.get('id') || params.get('guide') || 'pushups';
  const guide = params.get('guide') || id;
  const programId = params.get('programId') || params.get('program') || '';
  const enrollmentId = params.get('enrollmentId') || params.get('enrollment') || '';
  const returnUrl = params.get('returnUrl') || (programId ? `/programs/${encodeURIComponent(programId)}${enrollmentId ? `?enrollmentId=${encodeURIComponent(enrollmentId)}&logged=1` : '?logged=1'}` : '/progress');
  const isProgramSession = Boolean(programId);

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
  const [toast, setToast] = useState<SessionToast | null>(null);

  function showToast(nextToast: SessionToast) {
    setToast(nextToast);
  }

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
          name: params.get('name') || (isProgramSession ? 'Program Workout' : 'Workout Session'),
          category: params.get('category') || (isProgramSession ? 'Program' : 'Exercise'),
          description: isProgramSession ? 'Workout from your FlowFit program.' : 'FlowFit workout session.',
          image: 'fit.webp',
          duration: 10,
          calories: 80,
          level: isProgramSession ? 'Program' : 'Workout',
          difficulty: isProgramSession ? 'Program' : 'Workout',
          muscles: [],
          instructions: [],
        } as Workout);
      })
      .catch(() => {
        if (!active) return;
        setWorkout({
          id: guide,
          slug: guide,
          name: params.get('name') || (isProgramSession ? 'Program Workout' : 'Workout Session'),
          category: params.get('category') || (isProgramSession ? 'Program' : 'Exercise'),
          description: isProgramSession ? 'Workout from your FlowFit program.' : 'FlowFit workout session.',
          image: 'fit.webp',
          duration: 10,
          calories: 80,
          level: isProgramSession ? 'Program' : 'Workout',
          difficulty: isProgramSession ? 'Program' : 'Workout',
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

    if (seconds < 1) {
      showToast({
        type: 'warning',
        title: 'Start the timer first',
        message: 'You need to log some workout time before saving this session.',
      });
      return;
    }

    setSaving(true);
    setToast(null);

    try {
      await logWorkout({
        workoutId: workout.id,
        exerciseId: workout.id,
        workoutSlug: workout.slug || workout.id,
        id: workout.id,
        name: workout.name,
        category: workout.category,
        duration: Math.max(Math.round(seconds / 60), 1),
        seconds,
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

      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setRunning(false);
      setSaved(true);
      showToast({
        type: 'success',
        title: 'Workout saved',
        message: 'Choose where to go next. Your workout has been recorded successfully.',
        actions: isProgramSession
          ? [
              { label: 'Continue Program', href: returnUrl, primary: true },
              { label: 'Progress', href: '/progress' },
              { label: 'Workouts', href: '/workouts' },
              { label: 'Dashboard', href: '/dashboard' },
            ]
          : [
              { label: 'View Progress', href: '/progress', primary: true },
              { label: 'Another Workout', href: '/workouts' },
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Programs', href: '/programs' },
            ],
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Could not save workout',
        message: err instanceof Error ? err.message : 'Could not log workout.',
      });
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
        {toast && (
          <div className="ff-toast-viewport" role="status" aria-live="polite">
            <div className={`ff-session-toast ff-session-toast-${toast.type}`}>
              <button className="ff-toast-close" type="button" aria-label="Close notification" onClick={() => setToast(null)}>
                <X size={16} />
              </button>
              <p className="ff-toast-kicker">FlowFit</p>
              <h3>{toast.title}</h3>
              <p>{toast.message}</p>
              {toast.actions?.length ? (
                <div className="ff-toast-actions">
                  {toast.actions.map((action) => (
                    <Link key={`${action.label}-${action.href}`} href={action.href} className={action.primary ? 'primary-btn' : 'secondary-btn'}>
                      {action.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )}

        <div className="session-hero">
          <img src={imageUrl(workout.altImage || workout.image)} alt={workout.name} />
          <div className="session-hero-overlay" />
          <div className="session-hero-content">
            <div className="badge-row">
              <span className="badge badge-cat">{workout.category}</span>
              {isProgramSession && <span className="badge">Program Session</span>}
            </div>
            <h1 style={{ margin: '0 0 0.5rem', color: '#fff' }}>{workout.name}</h1>
            <p className="muted" style={{ color: 'rgba(255,255,255,0.82)' }}>{params.get('day') || 'Workout Session'}</p>
          </div>
        </div>

        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          <div>
            <div className="premium-card session-tutorial-card">
              <div>
                <p className="eyebrow">Tutorial Video</p>
                <h2 style={{ margin: '0.35rem 0 0.45rem' }}>Watch form before starting</h2>
                <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>Watch form and technique for {workout.name} before starting the timer.</p>
              </div>
              <a href={`https://www.youtube.com/results?search_query=${ytQuery}`} target="_blank" rel="noopener noreferrer" className="secondary-btn">
                <ExternalLink size={15} /> Watch on YouTube
              </a>
            </div>

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
                  <p className="sets-subtitle">{isProgramSession ? 'Log sets and reps, then continue your program flow.' : 'Log sets and reps, then save this workout.'}</p>
                </div>
                <button className="sets-add-btn" onClick={addSet} disabled={saving || saved}><Plus size={14} /> Add Set</button>
              </div>

              <div className="sets-table-head"><span>#</span><span>Reps</span><span>Load</span><span>✓</span><span /></div>
              {sets.map((row, index) => (
                <div className="set-row" key={index}>
                  <span className="set-num">{index + 1}</span>
                  <input className="set-input" type="number" min="0" value={row.reps} onChange={(e) => updateSet(index, 'reps', e.target.value)} disabled={saving || saved} />
                  <input className="set-input" type="number" min="0" step="0.5" value={row.load} placeholder="BW" onChange={(e) => updateSet(index, 'load', e.target.value)} disabled={saving || saved} />
                  <button className={`set-done-btn ${row.done ? 'done' : ''}`} onClick={() => updateSet(index, 'done', !row.done)} disabled={saving || saved}><Check size={12} /></button>
                  <button className="set-del-btn" disabled={sets.length === 1 || saving || saved} onClick={() => removeSet(index)}>×</button>
                </div>
              ))}
            </div>

            <div className="premium-card">
              <h2 style={{ marginBottom: '1rem' }}>Save Workout</h2>
              <div className="field">
                <label>Difficulty</label>
                <div className="session-difficulty-row">
                  {(['Easy', 'Moderate', 'Hard'] as const).map((item) => (
                    <button key={item} className={difficulty === item ? 'primary-btn' : 'secondary-btn'} onClick={() => setDifficulty(item)} disabled={saving || saved}>{item}</button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>Notes</label>
                <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How did it go?" disabled={saving || saved} />
              </div>
              <button className="primary-btn" style={{ width: '100%' }} onClick={handleLog} disabled={saving || saved}>
                {saving ? 'Saving…' : saved ? 'Saved' : 'Save Workout'}
              </button>
              <p className="muted" style={{ margin: '0.75rem 0 0', fontSize: '0.8rem', textAlign: 'center' }}>
                Start the timer before saving. After saving, four navigation options appear as a toast.
              </p>
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
