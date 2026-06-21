'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  Loader2,
  Save,
  Sparkles,
  Timer,
  Zap,
} from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import { generateWorkoutPlan, saveAiProgram } from '@/lib/api';
import styles from './generatePlan.module.css';

type Goal = 'general_fitness' | 'weight_loss' | 'muscle_gain' | 'endurance' | 'flexibility';
type Level = 'beginner' | 'intermediate' | 'advanced';

type GeneratedExercise = {
  name: string;
  sets?: number;
  reps?: string;
  restSeconds?: number;
  notes?: string | null;
  formTip?: string | null;
};

type GeneratedPlan = {
  workoutName?: string;
  name?: string;
  focus?: string;
  splitType?: string;
  warmUp?: string;
  coolDown?: string;
  scienceNotes?: string;
  progressionTips?: string;
  weeklyRecommendations?: string;
  estimatedDurationMinutes?: number;
  exercises?: GeneratedExercise[];
  [key: string]: unknown;
};

const GOALS: Array<{ value: Goal; label: string; hint: string }> = [
  { value: 'general_fitness', label: 'General Fitness', hint: 'Balanced strength, cardio, mobility' },
  { value: 'weight_loss', label: 'Fat Loss', hint: 'Higher density and calorie burn' },
  { value: 'muscle_gain', label: 'Muscle Gain', hint: 'Volume, tempo, and progressive overload' },
  { value: 'endurance', label: 'Endurance', hint: 'Conditioning and work capacity' },
  { value: 'flexibility', label: 'Mobility', hint: 'Recovery, posture, and joint-friendly work' },
];

const LEVELS: Array<{ value: Level; label: string }> = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

function splitList(value?: string) {
  if (!value) return [];
  return value.split('•').map((item) => item.trim()).filter(Boolean);
}

function displayPlanName(plan: GeneratedPlan | null, goal: Goal) {
  if (plan?.workoutName || plan?.name) return String(plan.workoutName || plan.name);
  return `${GOALS.find((item) => item.value === goal)?.label || 'FlowFit'} Session`;
}

function normalisePlan(raw: any): GeneratedPlan {
  const plan = raw?.plan || raw?.data?.plan || raw?.data || raw || {};
  const exercises = Array.isArray(plan.exercises) ? plan.exercises : [];
  return { ...plan, exercises };
}

export default function GeneratePlanPage() {
  const [goal, setGoal] = useState<Goal>('general_fitness');
  const [fitnessLevel, setFitnessLevel] = useState<Level>('beginner');
  const [sessionDuration, setSessionDuration] = useState(30);
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState(3);
  const [equipmentText, setEquipmentText] = useState('bodyweight');
  const [limitations, setLimitations] = useState('');
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedProgramId, setSavedProgramId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedGoal = useMemo(() => GOALS.find((item) => item.value === goal) || GOALS[0], [goal]);
  const warmUpItems = splitList(plan?.warmUp);
  const coolDownItems = splitList(plan?.coolDown);
  const exercises = plan?.exercises || [];

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSavedProgramId(null);
    setLoading(true);

    try {
      const equipment = equipmentText
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      const response = await generateWorkoutPlan({
        goal,
        fitnessLevel,
        equipment: equipment.length ? equipment : ['bodyweight'],
        sessionDuration,
        trainingDaysPerWeek,
        limitations: limitations.trim() || undefined,
      });

      const nextPlan = normalisePlan(response);
      setPlan(nextPlan);
      setSuccess('Your AI workout session is ready. Review it, then save it as a program when ready.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate workout plan.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!plan || exercises.length === 0) {
      setError('Generate a plan first before saving.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const name = displayPlanName(plan, goal);
      const response = await saveAiProgram({
        name,
        description: [
          plan.focus ? `Focus: ${plan.focus}` : '',
          plan.warmUp ? `Warm-up: ${plan.warmUp}` : '',
          plan.coolDown ? `Cool-down: ${plan.coolDown}` : '',
          plan.progressionTips ? `Progression: ${plan.progressionTips}` : '',
        ].filter(Boolean).join('\n'),
        category: goal,
        difficulty: fitnessLevel,
        exercises: exercises.map((exercise, index) => ({
          name: exercise.name,
          sets: Number(exercise.sets) || 3,
          reps: String(exercise.reps || '10'),
          restSeconds: Number(exercise.restSeconds) || 60,
          notes: exercise.notes || exercise.formTip || null,
          order: index,
        })),
        metadata: {
          aiPlan: plan,
          generatedAt: new Date().toISOString(),
          source: 'generate-plan-page',
        },
      });

      const program = response?.data || response?.program || response;
      setSavedProgramId(program?.id ? String(program.id) : null);
      setSuccess('Plan saved successfully. You can now open it from Programs and start logging.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save AI workout program.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell>
      <section className={`page-section ${styles.page}`}>
        <div className={styles.hero}>
          <div>
            <p className="eyebrow">AI Workout Generator</p>
            <h1>Generate Workout Session</h1>
            <p className="muted">
              Build a server-generated FlowFit session from your goal, level, equipment, time, and limits.
            </p>
          </div>
          <div className={styles.heroBadge}>
            <Sparkles size={18} />
            <span>Generate Plan Tool</span>
          </div>
        </div>

        {(error || success) && (
          <div className={`${styles.notice} ${error ? styles.noticeError : styles.noticeSuccess}`}>
            {error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{error || success}</span>
          </div>
        )}

        <div className={`grid grid-2 ${styles.shellGrid}`}>
          <form className={`premium-card ${styles.formCard}`} onSubmit={handleGenerate}>
            <div className={styles.cardTitleRow}>
              <CalendarDays size={22} />
              <div>
                <h2>Session Settings</h2>
                <p className="muted">These values are sent to your backend AI generator.</p>
              </div>
            </div>

            <div className="field">
              <label>Goal</label>
              <div className={styles.goalGrid}>
                {GOALS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`${styles.goalCard} ${goal === item.value ? styles.activeGoal : ''}`}
                    onClick={() => setGoal(item.value)}
                  >
                    <strong>{item.label}</strong>
                    <span>{item.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.twoFields}>
              <div className="field">
                <label>Fitness Level</label>
                <select value={fitnessLevel} onChange={(e) => setFitnessLevel(e.target.value as Level)}>
                  {LEVELS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Training Days / Week</label>
                <select value={trainingDaysPerWeek} onChange={(e) => setTrainingDaysPerWeek(Number(e.target.value))}>
                  {[1, 2, 3, 4, 5, 6].map((day) => <option key={day} value={day}>{day} day{day > 1 ? 's' : ''}</option>)}
                </select>
              </div>
            </div>

            <div className="field">
              <label>Available Time: {sessionDuration} minutes</label>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={sessionDuration}
                onChange={(e) => setSessionDuration(Number(e.target.value))}
              />
            </div>

            <div className="field">
              <label>Equipment</label>
              <input
                value={equipmentText}
                onChange={(e) => setEquipmentText(e.target.value)}
                placeholder="bodyweight, dumbbells, resistance bands"
              />
            </div>

            <div className="field">
              <label>Limitations / Injuries Optional</label>
              <textarea
                rows={3}
                value={limitations}
                onChange={(e) => setLimitations(e.target.value)}
                placeholder="Example: avoid jumping, knee pain, lower-back friendly..."
              />
            </div>

            <div className={styles.formStats}>
              <div><TargetIcon /><strong>{selectedGoal.label}</strong><span>Goal</span></div>
              <div><Timer size={18} /><strong>{sessionDuration} min</strong><span>Duration</span></div>
              <div><Activity size={18} /><strong>{trainingDaysPerWeek}x</strong><span>Weekly</span></div>
            </div>

            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? <><Loader2 className={styles.spin} size={16} /> Generating…</> : <><Zap size={16} /> Generate Plan</>}
            </button>
          </form>

          <article className={`premium-card ${styles.planCard}`}>
            <div className={styles.cardTitleRow}>
              <Sparkles size={22} />
              <div>
                <h2>{plan ? displayPlanName(plan, goal) : 'Generated Plan'}</h2>
                <p className="muted">
                  {plan ? `${fitnessLevel} · ${plan.estimatedDurationMinutes || sessionDuration} minutes · ${selectedGoal.label}` : 'Generate a server plan to preview it here.'}
                </p>
              </div>
            </div>

            {!plan ? (
              <div className={styles.emptyPlan}>
                <Dumbbell size={42} />
                <h3>No plan generated yet</h3>
                <p className="muted">Set your details and click Generate Plan. No AI Coach tools are shown on this page.</p>
              </div>
            ) : (
              <>
                <div className={styles.planMetaGrid}>
                  <span><strong>Focus</strong>{String(plan.focus || selectedGoal.label)}</span>
                  <span><strong>Split</strong>{String(plan.splitType || 'Smart Session')}</span>
                  <span><strong>Exercises</strong>{exercises.length}</span>
                </div>

                {warmUpItems.length > 0 && (
                  <section className={styles.planSection}>
                    <h3>Warm-up</h3>
                    <ul>{warmUpItems.map((item) => <li key={item}>{item}</li>)}</ul>
                  </section>
                )}

                <section className={styles.planSection}>
                  <h3>Main Workout</h3>
                  <div className={styles.exerciseList}>
                    {exercises.map((exercise, index) => (
                      <div className={styles.exerciseItem} key={`${exercise.name}-${index}`}>
                        <div>
                          <span>{String(index + 1).padStart(2, '0')}</span>
                          <strong>{exercise.name}</strong>
                          {exercise.notes || exercise.formTip ? <p>{exercise.notes || exercise.formTip}</p> : null}
                        </div>
                        <small>{Number(exercise.sets) || 3} sets · {exercise.reps || '10'} · {Number(exercise.restSeconds) || 60}s rest</small>
                      </div>
                    ))}
                  </div>
                </section>

                {coolDownItems.length > 0 && (
                  <section className={styles.planSection}>
                    <h3>Cool-down</h3>
                    <ul>{coolDownItems.map((item) => <li key={item}>{item}</li>)}</ul>
                  </section>
                )}

                {(plan.scienceNotes || plan.progressionTips || plan.weeklyRecommendations) && (
                  <section className={styles.notesGrid}>
                    {plan.scienceNotes ? <p>{String(plan.scienceNotes)}</p> : null}
                    {plan.progressionTips ? <p>{String(plan.progressionTips)}</p> : null}
                    {plan.weeklyRecommendations ? <p>{String(plan.weeklyRecommendations)}</p> : null}
                  </section>
                )}

                <div className={styles.actionRow}>
                  <button className="primary-btn" type="button" onClick={handleSave} disabled={saving}>
                    {saving ? <><Loader2 className={styles.spin} size={16} /> Saving…</> : <><Save size={16} /> Save as Program</>}
                  </button>
                  {savedProgramId ? (
                    <Link className="secondary-btn" href={`/programs/${savedProgramId}`}>Open Program</Link>
                  ) : (
                    <Link className="secondary-btn" href="/programs">Programs</Link>
                  )}
                </div>
              </>
            )}
          </article>
        </div>
      </section>
    </DashboardShell>
  );
}

function TargetIcon() {
  return <Activity size={18} />;
}
