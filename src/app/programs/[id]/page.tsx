'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Circle,
  Dumbbell,
  Lock,
  Play,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import { ProgramsAPI, getProgramById, getWorkouts } from '@/lib/api';
import { imageUrl } from '@/lib/utils';
import type { Program, ProgramEnrollment, ProgramUsageRecord } from '@/types/program';
import type { Workout } from '@/types/workout';

type ExerciseItem = {
  id: string;
  guideId: string;
  name: string;
  category: string;
  duration: number;
  calories: number;
  sets?: number;
  reps?: string | number;
  restSeconds?: number;
  notes?: string;
  globalDayIndex: number;
  exerciseIndex: number;
  weekNumber: number;
  dayNumber: number;
  dayName: string;
};

type DayItem = {
  key: string;
  globalIndex: number;
  weekNumber: number;
  dayNumber: number;
  dayName: string;
  exercises: ExerciseItem[];
};

function numberOr(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clean(value?: string) {
  return String(value || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '');
}

function guideIdFromName(name = '', category = '') {
  const source = name.toLowerCase();
  if (source.includes('burpee')) return 'burpees';
  if (source.includes('mountain')) return 'mountainclimbers';
  if (source.includes('jump squat')) return 'jumpsquats';
  if (source.includes('squat')) return 'squats';
  if (source.includes('lunge')) return 'lunges';
  if (source.includes('pike') && source.includes('push')) return 'pikepushups';
  if (source.includes('push')) return 'pushups';
  if (source.includes('dip')) return 'tricepdips';
  if (source.includes('plank')) return 'plank';
  if (source.includes('crunch')) return 'crunches';
  if (source.includes('leg raise')) return 'legraises';
  if (source.includes('russian')) return 'russiantwists';
  if (source.includes('glute')) return 'glutebridges';
  if (source.includes('jumping jack')) return 'jumpingjacks';
  if (source.includes('high knee')) return 'highknees';
  if (source.includes('butt kick')) return 'buttkicks';
  if (source.includes('sprint')) return 'sprints';
  if (source.includes('box')) return 'boxjumps';
  if (source.includes('downward')) return 'downwarddog';
  if (source.includes('child')) return 'childpose';
  if (source.includes('hip flexor')) return 'hipflexor';
  const cat = category.toLowerCase();
  if (cat.includes('cardio') || cat.includes('hiit')) return 'burpees';
  if (cat.includes('core')) return 'plank';
  return 'squats';
}

function findWorkoutMatch(item: any, workouts: Workout[]) {
  const lib = item?.exercise || {};
  const ids = [item?.exerciseId, item?.workoutId, item?.id, lib?.id, lib?.slug].filter(Boolean).map(String);
  const names = [item?.exerciseName, item?.name, lib?.name].filter(Boolean).map(clean);

  return workouts.find((workout) => {
    const workoutIds = [workout.id, workout.slug].filter(Boolean).map(String);
    if (workoutIds.some((id) => ids.includes(id))) return true;
    return names.some((name) => name && clean(workout.name) === name);
  });
}

function buildDays(program: Program, workouts: Workout[]): DayItem[] {
  const weeks = Array.isArray(program.weeks) ? program.weeks : [];
  const days: DayItem[] = [];

  weeks.forEach((week, weekIndex) => {
    const weekNumber = numberOr(week.weekNumber, weekIndex + 1);
    const weekDays = Array.isArray(week.days) ? week.days : [];

    weekDays.forEach((day, dayIndex) => {
      if (day.isRestDay) return;
      const rawExercises = Array.isArray(day.exercises) ? day.exercises : [];
      if (!rawExercises.length) return;

      const globalDayIndex = days.length;
      const dayNumber = numberOr(day.dayNumber, dayIndex + 1);
      const dayName = day.name || day.title || `Day ${dayNumber}`;

      const exercises = rawExercises.map((item, exerciseIndex) => {
        const lib = item.exercise || {};
        const match = findWorkoutMatch(item, workouts);
        const name = lib.name || match?.name || item.exerciseName || item.name || `Exercise ${exerciseIndex + 1}`;
        const category = lib.category || match?.category || program.category || 'Program';
        const guideId = match?.slug || match?.id || guideIdFromName(name, category);
        const id = item.exerciseId || lib.id || match?.id || item.id || guideId;
        const perMin = numberOr(lib.caloriesPerMin, 8);
        const duration = numberOr(match?.duration, numberOr(program.estimatedDurationMinutes, 10));

        return {
          id: String(id),
          guideId: String(guideId),
          name: String(name),
          category: String(category),
          duration,
          calories: numberOr(match?.calories, Math.max(40, Math.round(perMin * duration))),
          sets: item.sets,
          reps: item.reps,
          restSeconds: item.restSeconds,
          notes: item.notes,
          globalDayIndex,
          exerciseIndex,
          weekNumber,
          dayNumber,
          dayName,
        };
      });

      days.push({
        key: `${weekNumber}-${dayNumber}-${globalDayIndex}`,
        globalIndex: globalDayIndex,
        weekNumber,
        dayNumber,
        dayName,
        exercises,
      });
    });
  });

  return days;
}

function unwrapEnrollment(payload: any): ProgramEnrollment | null {
  const possible = payload?.data?.enrollment || payload?.data || payload?.enrollment || payload;
  if (possible && typeof possible === 'object' && !Array.isArray(possible)) return possible as ProgramEnrollment;
  return null;
}

function completionIndexes(records: ProgramUsageRecord[] | undefined, dayIndex: number) {
  const indexes = new Set<number>();
  (records || []).forEach((record) => {
    const action = String(record.action || '');
    const parts = action.split(':');
    if (parts[0] !== 'WORKOUT_COMPLETED') return;
    const d = Number(parts[1]);
    const ex = Number(parts[2]);
    if (d === dayIndex && Number.isFinite(ex)) indexes.add(ex);
  });
  return indexes;
}

function normalizeEnrollment(raw: any, programId: string): ProgramEnrollment | null {
  if (!raw) return null;
  return {
    ...raw,
    id: raw.id,
    programId: raw.programId || raw.program?.id || programId,
    completedDays: numberOr(raw.completedDays ?? raw.completed_days, 0),
    currentWeek: numberOr(raw.currentWeek ?? raw.current_week, 1),
    currentDay: numberOr(raw.currentDay ?? raw.current_day, 1),
    progress: numberOr(raw.progress, 0),
    isActive: raw.isActive ?? raw.is_active ?? true,
    usageRecords: Array.isArray(raw.usageRecords) ? raw.usageRecords : [],
  };
}

function circleStyle(percent: number) {
  const circumference = 2 * Math.PI * 54;
  return {
    strokeDasharray: circumference,
    strokeDashoffset: circumference - (circumference * percent) / 100,
  };
}

export default function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [program, setProgram] = useState<Program | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [enrollment, setEnrollment] = useState<ProgramEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadData() {
    if (!id) return;
    setLoading(true);
    setError('');

    try {
      const [programData, workoutData] = await Promise.all([
        getProgramById(id),
        getWorkouts({ limit: 100 }),
      ]);

      const currentProgram = programData as Program;
      setProgram(currentProgram);
      setWorkouts(Array.isArray(workoutData) ? workoutData : []);

      const directEnrollment = normalizeEnrollment((currentProgram as any)?.activeEnrollment, currentProgram.id);
      if (directEnrollment?.id) {
        setEnrollment(directEnrollment);
      } else {
        const existing = await ProgramsAPI.getEnrollmentForProgram(currentProgram.id).catch(() => null);
        setEnrollment(normalizeEnrollment(existing, currentProgram.id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load program.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const days = useMemo(() => (program ? buildDays(program, workouts) : []), [program, workouts]);
  const totalDays = days.length;
  const completedDays = enrollment ? Math.max(0, Math.min(totalDays, numberOr(enrollment.completedDays, 0))) : 0;
  const progressPercent = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
  const currentDay = days[Math.min(completedDays, Math.max(totalDays - 1, 0))];
  const completedDayList = days.slice(0, completedDays);
  const completedForCurrentDay = currentDay ? completionIndexes(enrollment?.usageRecords, currentDay.globalIndex) : new Set<number>();
  const currentDayDoneCount = currentDay ? currentDay.exercises.filter((exercise) => completedForCurrentDay.has(exercise.exerciseIndex)).length : 0;
  const currentDayPercent = currentDay?.exercises.length ? Math.round((currentDayDoneCount / currentDay.exercises.length) * 100) : 0;
  const isProgramComplete = !!enrollment && totalDays > 0 && completedDays >= totalDays;

  async function enrollProgram() {
    if (!program) return;
    setMessage('');
    setError('');
    setEnrolling(true);

    try {
      const response = await ProgramsAPI.enrollInProgram(program.id);
      const enrolled = normalizeEnrollment(unwrapEnrollment(response), program.id);
      if (!enrolled?.id) throw new Error('Enrollment was saved, but the server did not return enrollment details.');
      setEnrollment(enrolled);
      setMessage(response?.alreadyEnrolled ? 'You are already enrolled. Continue your current day below.' : 'Enrolled. Your first practice day is now unlocked.');
      router.replace(`/programs/${encodeURIComponent(program.id)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not enroll in this program.');
    } finally {
      setEnrolling(false);
    }
  }

  async function restartProgram() {
    if (!program) return;
    setMessage('');
    setError('');
    setRestarting(true);

    try {
      const response = await ProgramsAPI.restartProgram(program.id);
      const restarted = normalizeEnrollment(unwrapEnrollment(response), program.id);
      if (!restarted?.id) throw new Error('Program restarted, but enrollment details were not returned.');
      setEnrollment(restarted);
      setMessage('Program restarted. Begin again from Day 1.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not restart this program.');
    } finally {
      setRestarting(false);
    }
  }

  function sessionHref(exercise: ExerciseItem) {
    if (!program || !enrollment?.id || !currentDay) return '#';
    const nextDay = days[Math.min(exercise.globalDayIndex + 1, Math.max(days.length - 1, 0))];
    const params = new URLSearchParams({
      id: exercise.id,
      guide: exercise.guideId,
      name: exercise.name,
      category: exercise.category,
      duration: String(exercise.duration),
      cal: String(Math.max(1, Math.round(exercise.calories / Math.max(exercise.duration, 1)))),
      program: program.id,
      enrollment: enrollment.id,
      currentWeek: String(exercise.weekNumber),
      currentDay: String(exercise.dayNumber),
      globalDayIndex: String(exercise.globalDayIndex),
      exIndex: String(exercise.exerciseIndex),
      dayTotal: String(currentDay.exercises.length),
      totalDays: String(days.length),
      nextWeek: String(nextDay?.weekNumber || exercise.weekNumber),
      nextDay: String(nextDay?.dayNumber || exercise.dayNumber),
      returnUrl: `/programs/${encodeURIComponent(program.id)}`,
    });
    return `/workouts/session?${params.toString()}`;
  }

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
          <Link href="/programs" className="secondary-btn" style={{ marginTop: '1rem' }}>Back to Programs</Link>
        </section>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <section className="page-section program-detail-page">
        <Link href="/programs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--t2)', marginBottom: '1.25rem' }}>
          <ArrowLeft size={15} /> Back to Programs
        </Link>

        {message && <div className="success-alert">{message}</div>}
        {error && <div className="alert">{error}</div>}

        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          <article className="premium-card program-hero-card">
            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
              <img src={imageUrl(program.image || 'fit1.webp')} alt={program.title} className="hero-img" style={{ height: 300 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 30%,rgba(7,6,12,0.88))', borderRadius: 18, display: 'flex', alignItems: 'flex-end', padding: '1rem' }}>
                <span className="badge">{program.level || program.difficulty || 'Program'}</span>
              </div>
            </div>

            <p className="eyebrow">{program.focus || program.category || program.level}</p>
            <h1 style={{ marginBottom: '0.75rem' }}>{program.title}</h1>
            <p className="muted">{program.description}</p>

            <div className="metric-row">
              <span><CalendarDays size={14} /> {program.duration}</span>
              <span><CheckCircle2 size={14} /> {days.reduce((sum, day) => sum + day.exercises.length, 0)} workouts</span>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1.25rem' }}>
              {!enrollment ? (
                <button className="primary-btn" onClick={enrollProgram} disabled={enrolling}>
                  {enrolling ? 'Enrolling…' : 'Enroll in Program'}
                </button>
              ) : (
                <button className="primary-btn" disabled>
                  <CheckCircle2 size={16} /> Enrolled — Day {Math.min(completedDays + 1, totalDays || 1)} Unlocked
                </button>
              )}

              <button className="secondary-btn" onClick={restartProgram} disabled={restarting || !enrollment}>
                <RotateCcw size={15} /> {restarting ? 'Restarting…' : 'Restart Program'}
              </button>
            </div>
          </article>

          <aside className="premium-card">
            <h2 style={{ marginBottom: '1.25rem' }}>{enrollment ? 'Your Program Progress' : 'Join This Program'}</h2>
            <div style={{ width: 160, height: 160, position: 'relative', margin: '0 auto 1.25rem' }}>
              <svg viewBox="0 0 130 130" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="65" cy="65" r="54" fill="none" stroke="var(--white-06)" strokeWidth="10" />
                <circle cx="65" cy="65" r="54" fill="none" stroke="var(--Au)" strokeWidth="10" strokeLinecap="round" style={circleStyle(progressPercent)} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                <div>
                  <strong style={{ fontFamily: 'var(--f-mono)', fontSize: '1.8rem', color: 'var(--Au)' }}>{progressPercent}%</strong>
                  <p className="muted" style={{ margin: 0, fontSize: '0.75rem' }}>complete</p>
                </div>
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: '0.75rem' }}>
              <div className="stat-card"><p className="stat-label">Completed Days</p><div className="stat-value">{completedDays}</div></div>
              <div className="stat-card"><p className="stat-label">Total Days</p><div className="stat-value">{totalDays}</div></div>
            </div>
          </aside>
        </div>

        <div className="grid grid-2" style={{ marginTop: '1.5rem', alignItems: 'start' }}>
          <article className="premium-card">
            <p className="eyebrow">{enrollment ? 'Current Practice Day' : 'Preview Day 1'}</p>
            <h2 style={{ marginBottom: '0.5rem' }}>{currentDay?.dayName || 'Practice Day'}</h2>
            <p className="muted" style={{ marginBottom: '1rem' }}>
              {enrollment ? `${currentDayDoneCount}/${currentDay?.exercises.length || 0} workouts logged today` : 'Enroll to unlock this day and start logging workouts.'}
            </p>

            {currentDay && enrollment && !isProgramComplete && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ height: 8, background: 'var(--white-05)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${currentDayPercent}%`, height: '100%', background: 'var(--g-Au)' }} />
                </div>
              </div>
            )}

            {isProgramComplete ? (
              <div className="success-alert"><Trophy size={18} /> Program completed. Excellent work.</div>
            ) : currentDay?.exercises.length ? (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {currentDay.exercises.map((exercise) => {
                  const done = completedForCurrentDay.has(exercise.exerciseIndex);
                  const locked = !enrollment;
                  return locked ? (
                    <div key={`${exercise.id}-${exercise.exerciseIndex}`} className="mini-link" style={{ opacity: 0.75 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Lock size={16} style={{ color: 'var(--t3)' }} />
                        <div>
                          <strong>{exercise.name}</strong>
                          <p className="muted" style={{ margin: 0, fontSize: '0.75rem' }}>{exercise.sets ? `${exercise.sets} sets` : ''} {exercise.reps ? `· ${exercise.reps} reps` : ''}</p>
                        </div>
                      </div>
                      <span className="muted">Enroll first</span>
                    </div>
                  ) : done ? (
                    <div key={`${exercise.id}-${exercise.exerciseIndex}`} className="mini-link" style={{ borderColor: 'var(--sage-30)', background: 'var(--sage-dim)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <CheckCircle2 size={17} style={{ color: 'var(--sage)' }} />
                        <div>
                          <strong>{exercise.name}</strong>
                          <p className="muted" style={{ margin: 0, fontSize: '0.75rem' }}>Logged for this day</p>
                        </div>
                      </div>
                      <span style={{ color: 'var(--sage)', fontSize: '0.8rem' }}>DONE</span>
                    </div>
                  ) : (
                    <Link key={`${exercise.id}-${exercise.exerciseIndex}`} href={sessionHref(exercise)} className="mini-link">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                        <Play size={17} style={{ color: 'var(--Au)' }} />
                        <div style={{ minWidth: 0 }}>
                          <strong>{exercise.name}</strong>
                          <p className="muted" style={{ margin: 0, fontSize: '0.75rem' }}>{exercise.sets ? `${exercise.sets} sets` : ''} {exercise.reps ? `· ${exercise.reps} reps` : ''} {exercise.restSeconds ? `· ${exercise.restSeconds}s rest` : ''}</p>
                        </div>
                      </div>
                      <span style={{ color: 'var(--Au)', fontSize: '0.8rem' }}>START</span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="muted">No workouts were returned for this practice day.</p>
            )}
          </article>

          <article className="premium-card">
            <p className="eyebrow">Completed Days</p>
            <h2 style={{ marginBottom: '1rem' }}>History</h2>
            {completedDayList.length === 0 ? (
              <p className="muted">Completed days will appear here after you finish every workout in the current day.</p>
            ) : (
              <div style={{ display: 'grid', gap: '0.7rem' }}>
                {completedDayList.map((day) => (
                  <div key={day.key} className="mini-link" style={{ borderColor: 'var(--sage-30)', background: 'var(--sage-dim)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <CheckCircle2 size={17} style={{ color: 'var(--sage)' }} />
                      <div>
                        <strong>{day.dayName}</strong>
                        <p className="muted" style={{ margin: 0, fontSize: '0.75rem' }}>{day.exercises.length} workouts completed</p>
                      </div>
                    </div>
                    <span style={{ color: 'var(--sage)', fontSize: '0.78rem' }}>COMPLETE</span>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>
      </section>
    </DashboardShell>
  );
}
