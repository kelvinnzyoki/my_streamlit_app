'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
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
import type { Program } from '@/types/program';
import type { Workout } from '@/types/workout';

type Enrollment = {
  id?: string;
  programId?: string;
  completedDays?: number;
  currentWeek?: number;
  currentDay?: number;
  progress?: number;
  isActive?: boolean;

  // Backend compatibility: some responses may still use snake_case keys.
  completed_days?: number;
  current_week?: number;
  current_day?: number;
  is_active?: boolean;

  program?: { id?: string };
};

type ProgramExercise = {
  id: string;
  guideId?: string;
  name: string;
  category: string;
  duration: number;
  calories: number;
  sets?: number;
  reps?: string | number;
  restSeconds?: number;
  notes?: string;
  weekIndex: number;
  dayIndex: number;
  globalDayIndex: number;
  exerciseIndex: number;
  weekName: string;
  dayName: string;
};

type ProgramDay = {
  key: string;
  globalIndex: number;
  weekIndex: number;
  dayIndex: number;
  weekNumber: number;
  dayNumber: number;
  weekName: string;
  dayName: string;
  exercises: ProgramExercise[];
};

type ServerProgram = Program & {
  weeks?: any[];
  totalExercises?: number;
  raw?: any;
};

function clean(value?: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '');
}

function numberOr(value: any, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
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

function findWorkoutForProgramItem(item: any, workouts: Workout[]) {
  const lib = item?.exercise || {};
  const ids = [
    item?.exerciseId,
    item?.workoutId,
    item?.id,
    item?.guideId,
    lib?.id,
    lib?.slug,
  ]
    .filter(Boolean)
    .map(String);

  const names = [item?.exerciseName, item?.name, lib?.name]
    .filter(Boolean)
    .map(clean);

  return workouts.find((workout) => {
    const workoutIds = [workout.id, workout.slug].filter(Boolean).map(String);
    if (workoutIds.some((workoutId) => ids.includes(workoutId))) return true;
    return names.some((name) => name && clean(workout.name) === name);
  });
}

function buildProgramDays(program: ServerProgram, workouts: Workout[]): ProgramDay[] {
  const weeks = Array.isArray(program.weeks) ? program.weeks : [];
  const days: ProgramDay[] = [];

  weeks.forEach((week: any, weekIndex: number) => {
    const weekNumber = numberOr(week.weekNumber ?? week.week_number, weekIndex + 1);
    const weekName = week.name || week.title || `Week ${weekNumber}`;

    (week.days || []).forEach((day: any, dayIndex: number) => {
      const dayNumber = numberOr(day.dayNumber ?? day.day_number, dayIndex + 1);
      const dayName = day.name || day.title || `Workout Day ${dayNumber}`;
      const globalDayIndex = days.length;

      const exercises: ProgramExercise[] = (day.exercises || []).map((item: any, exerciseIndex: number) => {
        const lib = item?.exercise || {};
        const match = findWorkoutForProgramItem(item, workouts);
        const name =
          lib.name ||
          match?.name ||
          item.exerciseName ||
          item.name ||
          `Exercise ${exerciseIndex + 1}`;
        const category = lib.category || match?.category || item.category || program.category || 'Program';
        const guideId = item.guideId || guideIdFromName(name, category);
        const sessionId =
          match?.slug ||
          match?.id ||
          lib.slug ||
          lib.id ||
          item.exerciseId ||
          item.workoutId ||
          item.id ||
          guideId ||
          name;

        return {
          id: String(sessionId),
          guideId,
          name,
          category,
          duration: numberOr(match?.duration ?? item.duration ?? item.estimatedDuration, 10),
          calories: numberOr(match?.calories ?? item.calories ?? item.caloriesBurned, 80),
          sets: item.sets,
          reps: item.reps,
          restSeconds: item.restSeconds ?? item.rest_seconds,
          notes: item.notes,
          weekIndex,
          dayIndex,
          globalDayIndex,
          exerciseIndex,
          weekName,
          dayName,
        };
      });

      if (exercises.length) {
        days.push({
          key: `${weekNumber}-${dayNumber}-${globalDayIndex}`,
          globalIndex: globalDayIndex,
          weekIndex,
          dayIndex,
          weekNumber,
          dayNumber,
          weekName,
          dayName,
          exercises,
        });
      }
    });
  });

  return days;
}

function unwrapEnrollment(payload: any): Enrollment | null {
  const possible = payload?.data?.enrollment || payload?.data || payload?.enrollment || payload;
  if (possible && typeof possible === 'object' && !Array.isArray(possible)) return possible;
  return null;
}

function arrayPayload(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.enrollments)) return payload.enrollments;
  if (Array.isArray(payload?.data?.enrollments)) return payload.data.enrollments;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
}

function completionStorageKey(programId: string, enrollmentId?: string) {
  return `flowfit:program:${programId}:enrollment:${enrollmentId || 'preview'}:exercise-progress`;
}

function parseStoredProgress(raw: string | null): Record<string, number[]> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function progressCircleStyle(percent: number) {
  const circumference = 2 * Math.PI * 54;
  return {
    strokeDasharray: circumference,
    strokeDashoffset: circumference - (circumference * percent) / 100,
  };
}

export default function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [program, setProgram] = useState<ServerProgram | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [exerciseProgress, setExerciseProgress] = useState<Record<string, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const handledReturnRef = useRef(false);

  useEffect(() => {
    if (!id) return;

    let active = true;
    setLoading(true);
    setError('');

    Promise.all([
      getProgramById(id),
      getWorkouts({ limit: 100 }),
      ProgramsAPI.getUserPrograms().catch(() => null),
    ])
      .then(([programData, workoutData, enrollmentsPayload]) => {
        if (!active) return;

        const enrollments = arrayPayload(enrollmentsPayload).map((item) => ({
          ...item,
          completedDays: numberOr(item.completedDays ?? item.completed_days, 0),
          currentWeek: numberOr(item.currentWeek ?? item.current_week, 1),
          currentDay: numberOr(item.currentDay ?? item.current_day, 1),
          progress: numberOr(item.progress, 0),
        }));

        const queryEnrollmentId = searchParams.get('enrollmentId') || searchParams.get('enrollment');
        const foundEnrollment = enrollments.find((item) =>
          String(item.id || '') === String(queryEnrollmentId || '') ||
          String(item.programId || item.program?.id || '') === String(id),
        ) || null;

        setProgram(programData as ServerProgram);
        setWorkouts(Array.isArray(workoutData) ? workoutData : []);
        setEnrollment(foundEnrollment);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Could not load program.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, searchParams]);

  const programDays = useMemo(
    () => program ? buildProgramDays(program, workouts) : [],
    [program, workouts],
  );

  const totalDays = programDays.length;
  const completedDays = enrollment
    ? Math.max(0, Math.min(totalDays, numberOr(enrollment.completedDays, 0)))
    : 0;
  const progressPercent = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
  const currentDayIndex = totalDays > 0 ? Math.min(completedDays, totalDays - 1) : 0;
  const currentDay = programDays[currentDayIndex];
  const completedDayList = programDays.slice(0, completedDays);
  const storageKey = program && enrollment ? completionStorageKey(program.id, enrollment.id) : '';
  const completedExerciseIndexes = currentDay
    ? new Set(exerciseProgress[String(currentDay.globalIndex)] || [])
    : new Set<number>();
  const currentDayCompletedCount = currentDay
    ? currentDay.exercises.filter((exercise) => completedExerciseIndexes.has(exercise.exerciseIndex)).length
    : 0;
  const currentDayPercent = currentDay?.exercises.length
    ? Math.round((currentDayCompletedCount / currentDay.exercises.length) * 100)
    : 0;

  useEffect(() => {
    if (!program || !enrollment || typeof window === 'undefined') {
      setExerciseProgress({});
      return;
    }

    setExerciseProgress(parseStoredProgress(localStorage.getItem(completionStorageKey(program.id, enrollment.id))));
  }, [program?.id, enrollment?.id]);

  useEffect(() => {
    if (!program || !enrollment || !storageKey || typeof window === 'undefined') return;
    localStorage.setItem(storageKey, JSON.stringify(exerciseProgress));
  }, [exerciseProgress, program, enrollment, storageKey]);

  async function completeDay(dayIndex: number, forcedProgress?: Record<string, number[]>) {
    if (!program || !enrollment?.id || !totalDays) return;

    const safeCompletedDays = Math.max(0, Math.min(totalDays, numberOr(enrollment.completedDays, 0)));
    if (dayIndex !== safeCompletedDays) return;

    setSavingProgress(true);
    setError('');

    try {
      const newCompletedDays = Math.min(totalDays, safeCompletedDays + 1);
      const nextDay = programDays[Math.min(newCompletedDays, totalDays - 1)];
      const updated = await ProgramsAPI.updateProgress(enrollment.id, {
        completedDays: newCompletedDays,
        currentWeek: nextDay?.weekNumber || Math.min(numberOr(program.durationWeeks, 1), 1),
        currentDay: nextDay?.dayNumber || 1,
      });

      const updatedEnrollment = unwrapEnrollment(updated) || {};
      setEnrollment((previous) => ({
        ...(previous || {}),
        ...updatedEnrollment,
        id: previous?.id || updatedEnrollment.id || enrollment.id,
        programId: previous?.programId || updatedEnrollment.programId || program.id,
        completedDays: newCompletedDays,
        currentWeek: nextDay?.weekNumber || updatedEnrollment.currentWeek || 1,
        currentDay: nextDay?.dayNumber || updatedEnrollment.currentDay || 1,
        progress: Math.round((newCompletedDays / totalDays) * 100),
      }));

      const progressToSave = forcedProgress || exerciseProgress;
      const cleanedProgress = { ...progressToSave };
      delete cleanedProgress[String(dayIndex)];
      setExerciseProgress(cleanedProgress);
      setMessage(newCompletedDays >= totalDays ? 'Program completed. Excellent work!' : 'Day completed. Continue with the next day.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save program progress.');
    } finally {
      setSavingProgress(false);
    }
  }

  useEffect(() => {
    if (handledReturnRef.current || !program || !enrollment || !programDays.length) return;
    if (searchParams.get('exDone') !== '1') return;

    const dayIndex = numberOr(searchParams.get('dayIndex'), -1);
    const exIndex = numberOr(searchParams.get('exIndex'), -1);
    if (dayIndex < 0 || exIndex < 0) return;

    handledReturnRef.current = true;

    setExerciseProgress((previous) => {
      const key = String(dayIndex);
      const nextSet = new Set(previous[key] || []);
      nextSet.add(exIndex);
      const nextProgress = { ...previous, [key]: Array.from(nextSet).sort((a, b) => a - b) };
      const day = programDays[dayIndex];
      const allDone = !!day && nextSet.size >= day.exercises.length;

      if (allDone) {
        window.setTimeout(() => completeDay(dayIndex, nextProgress), 250);
      }

      return nextProgress;
    });

    const base = `/programs/${encodeURIComponent(program.id)}${enrollment.id ? `?enrollmentId=${encodeURIComponent(enrollment.id)}` : ''}`;
    router.replace(base);
    setMessage('Workout logged. Progress updated.');
  }, [searchParams, program, enrollment, programDays, router]);

  async function enroll(restart = false) {
    if (!program) return;

    setMessage('');
    setError('');
    setEnrolling(true);

    try {
      const response = restart
        ? await ProgramsAPI.restartProgram(program.id)
        : await ProgramsAPI.enrollInProgram(program.id);

      const newEnrollment = unwrapEnrollment(response) || {};
      const mergedEnrollment: Enrollment = {
        ...newEnrollment,
        id: newEnrollment.id,
        programId: newEnrollment.programId || program.id,
        completedDays: numberOr(newEnrollment.completedDays ?? newEnrollment.completed_days, 0),
        currentWeek: numberOr(newEnrollment.currentWeek ?? newEnrollment.current_week, 1),
        currentDay: numberOr(newEnrollment.currentDay ?? newEnrollment.current_day, 1),
        progress: numberOr(newEnrollment.progress, 0),
      };

      setEnrollment(mergedEnrollment);
      setExerciseProgress({});
      setMessage(restart ? 'Program restarted. Begin with Day 1.' : 'You are enrolled. Start today’s workouts below.');

      if (mergedEnrollment.id) {
        router.replace(`/programs/${encodeURIComponent(program.id)}?enrollmentId=${encodeURIComponent(mergedEnrollment.id)}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not enroll in this program.');
    } finally {
      setEnrolling(false);
    }
  }

  function sessionHref(exercise: ProgramExercise) {
    if (!program) return '/workouts';

    const enrollmentId = enrollment?.id || '';
    const returnUrl = `/programs/${encodeURIComponent(program.id)}?enrollmentId=${encodeURIComponent(enrollmentId)}&exDone=1&dayIndex=${exercise.globalDayIndex}&exIndex=${exercise.exerciseIndex}`;

    const params = new URLSearchParams({
      id: exercise.id,
      guide: exercise.guideId || guideIdFromName(exercise.name, exercise.category),
      name: exercise.name,
      category: exercise.category,
      cal: String(Math.max(1, Math.round(exercise.calories / Math.max(exercise.duration, 1)))),
      program: program.id,
      enrollment: enrollmentId,
      day: exercise.dayName,
      dayIndex: String(exercise.globalDayIndex),
      exIndex: String(exercise.exerciseIndex),
      returnUrl,
    });

    return `/workouts/session?${params.toString()}`;
  }

  if (loading) {
    return (
      <DashboardShell>
        <section className="page-section">
          <p className="muted">Loading program…</p>
        </section>
      </DashboardShell>
    );
  }

  if (!program) {
    return (
      <DashboardShell>
        <section className="page-section">
          <p className="muted">Program not found.</p>
          <Link href="/programs" className="secondary-btn" style={{ marginTop: '1rem' }}>
            Back to Programs
          </Link>
        </section>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <section className="page-section program-detail-page">
        <Link
          href="/programs"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--t2)', marginBottom: '1.25rem' }}
        >
          <ArrowLeft size={15} /> Back to Programs
        </Link>

        {message && <div className="success-alert">{message}</div>}
        {error && <div className="alert">{error}</div>}

        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          <article className="premium-card program-hero-card">
            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
              <img src={imageUrl(program.image || 'fit1.webp')} alt={program.title} className="hero-img" style={{ height: 300 }} />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg,transparent 30%,rgba(7,6,12,0.88))',
                  borderRadius: 18,
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '1rem',
                }}
              >
                <span className="badge">{program.level || program.difficulty || 'Program'}</span>
              </div>
            </div>

            <p className="eyebrow">{program.focus || program.category || program.level}</p>
            <h1 style={{ marginBottom: '0.75rem' }}>{program.title}</h1>
            <p className="muted">{program.description}</p>

            <div className="metric-row">
              <span><CalendarDays size={14} /> {program.duration}</span>
              <span><CheckCircle2 size={14} /> {programDays.reduce((sum, day) => sum + day.exercises.length, 0)} exercises</span>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1.25rem' }}>
              {!enrollment ? (
                <button className="primary-btn" onClick={() => enroll(false)} disabled={enrolling}>
                  {enrolling ? 'Saving…' : 'Enroll in Program'}
                </button>
              ) : (
                <button
                  className="primary-btn"
                  onClick={() => {
                    const firstPending = currentDay?.exercises.find((exercise) => !completedExerciseIndexes.has(exercise.exerciseIndex));
                    if (firstPending) window.location.href = sessionHref(firstPending);
                  }}
                  disabled={!currentDay || progressPercent >= 100}
                >
                  {progressPercent >= 100 ? 'Program Completed' : `Continue ${currentDay?.dayName || 'Workout'}`}
                </button>
              )}

              <button className="secondary-btn" onClick={() => enroll(true)} disabled={enrolling || savingProgress}>
                <RotateCcw size={15} /> Restart Program
              </button>
            </div>
          </article>

          <aside className="premium-card" style={{ position: 'sticky', top: '1rem' }}>
            <h2 style={{ marginBottom: '1.25rem' }}>{enrollment ? 'Your Progress' : 'Join This Program'}</h2>

            <div style={{ width: 150, height: 150, margin: '0 auto 1.25rem', position: 'relative' }}>
              <svg viewBox="0 0 130 130" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                <circle cx="65" cy="65" r="54" fill="none" stroke="var(--white-06)" strokeWidth="10" />
                <circle
                  cx="65"
                  cy="65"
                  r="54"
                  fill="none"
                  stroke="url(#programProgressGradient)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  style={{ ...progressCircleStyle(progressPercent), transition: 'stroke-dashoffset 500ms ease' }}
                />
                <defs>
                  <linearGradient id="programProgressGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--Au-hi)" />
                    <stop offset="55%" stopColor="var(--Au)" />
                    <stop offset="100%" stopColor="var(--Au-lo)" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                <div>
                  <strong style={{ display: 'block', fontFamily: 'var(--f-mono)', fontSize: '1.6rem', color: 'var(--Au-hi)' }}>{progressPercent}%</strong>
                  <span className="muted" style={{ fontSize: '0.75rem' }}>complete</span>
                </div>
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="premium-card" style={{ padding: '0.85rem' }}><strong>{completedDays}</strong><p className="muted" style={{ margin: 0, fontSize: '0.75rem' }}>Days done</p></div>
              <div className="premium-card" style={{ padding: '0.85rem' }}><strong>{Math.max(totalDays - completedDays, 0)}</strong><p className="muted" style={{ margin: 0, fontSize: '0.75rem' }}>Days left</p></div>
            </div>

            {currentDay && enrollment && progressPercent < 100 && (
              <div>
                <p className="eyebrow">Current Day</p>
                <h3 style={{ marginTop: '0.35rem' }}>{currentDay.weekName} · {currentDay.dayName}</h3>
                <p className="muted" style={{ fontSize: '0.82rem' }}>{currentDayCompletedCount}/{currentDay.exercises.length} workouts logged today.</p>
                <div style={{ height: 8, background: 'var(--white-06)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${currentDayPercent}%`, height: '100%', background: 'var(--g-Au)', borderRadius: 99 }} />
                </div>
              </div>
            )}
          </aside>
        </div>

        {completedDayList.length > 0 && (
          <article className="premium-card" style={{ marginTop: '1.5rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Completed Days</h2>
            <div style={{ display: 'grid', gap: '0.65rem' }}>
              {completedDayList.map((day) => (
                <div key={day.key} className="mini-link" style={{ borderColor: 'var(--sage-30)', background: 'var(--sage-dim)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--sage)' }} />
                    <div>
                      <strong>{day.weekName} · {day.dayName}</strong>
                      <p className="muted" style={{ margin: 0, fontSize: '0.75rem' }}>{day.exercises.length} workouts completed</p>
                    </div>
                  </div>
                  <span style={{ color: 'var(--sage)', fontWeight: 700 }}>DONE</span>
                </div>
              ))}
            </div>
          </article>
        )}

        <article className="premium-card" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <p className="eyebrow">{enrollment ? 'Today’s Workouts' : 'Preview Day 1'}</p>
              <h2 style={{ marginTop: '0.35rem' }}>{currentDay ? `${currentDay.weekName} · ${currentDay.dayName}` : 'Program Workouts'}</h2>
            </div>
            <span className="badge">{currentDay ? `${currentDayCompletedCount}/${currentDay.exercises.length}` : '0/0'}</span>
          </div>

          {!currentDay ? (
            <p className="muted">This program does not have workout days yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {currentDay.exercises.map((exercise) => {
                const isDone = completedExerciseIndexes.has(exercise.exerciseIndex) || completedDays > currentDay.globalIndex;
                const isLocked = !enrollment;

                return (
                  <Link
                    key={`${exercise.globalDayIndex}-${exercise.exerciseIndex}-${exercise.id}`}
                    href={isLocked || isDone ? '#' : sessionHref(exercise)}
                    onClick={(event) => {
                      if (isLocked || isDone) event.preventDefault();
                    }}
                    className="mini-link"
                    style={{
                      borderColor: isDone ? 'var(--sage-30)' : undefined,
                      background: isDone ? 'var(--sage-dim)' : undefined,
                      opacity: isLocked ? 0.78 : 1,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                      {isDone ? <CheckCircle2 size={20} style={{ color: 'var(--sage)' }} /> : isLocked ? <Lock size={20} /> : <Circle size={20} style={{ color: 'var(--Au)' }} />}
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ textDecoration: isDone ? 'line-through' : 'none' }}>{exercise.name}</strong>
                        <p className="muted" style={{ margin: 0, fontSize: '0.75rem' }}>
                          {exercise.category} {exercise.sets ? `· ${exercise.sets} sets` : ''} {exercise.reps ? `· ${exercise.reps} reps` : ''}
                        </p>
                      </div>
                    </div>
                    {isDone ? (
                      <span style={{ color: 'var(--sage)', fontWeight: 700 }}>LOGGED</span>
                    ) : isLocked ? (
                      <span className="muted" style={{ fontSize: '0.78rem' }}>Enroll first</span>
                    ) : (
                      <span style={{ color: 'var(--Au)', display: 'inline-flex', alignItems: 'center', gap: 5 }}><Play size={14} /> Start</span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </article>

        {progressPercent >= 100 && (
          <article className="premium-card" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Trophy size={34} style={{ color: 'var(--Au)' }} />
            <h2>Program Complete</h2>
            <p className="muted">You finished every scheduled day in this program.</p>
          </article>
        )}
      </section>
    </DashboardShell>
  );
}
