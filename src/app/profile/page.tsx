'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Save, User, Activity, Sparkles, Scale, Target, MapPin, CalendarDays } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import { ProgramsAPI, UserAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast, sanitizeClientMessage } from '@/components/ToastProvider';
import styles from './profile.module.css';
import Footer from '@/components/footer';
type ProfileForm = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  height: string;
  weight: string;
  targetWeight: string;
  fitnessLevel: string;
  fitnessGoal: string;
  region: string;
  bio: string;
};

type AiExercise = {
  name?: string;
  sets?: string | number;
  reps?: string | number;
  restSeconds?: string | number;
  notes?: string;
};

type SavedAiPlan = {
  serverSaved?: boolean;
  savedAt?: string;
  name?: string;
  difficulty?: string;
  category?: string;
  exercises?: AiExercise[];
  aiPlan?: {
    workoutName?: string;
    focus?: string;
    level?: string;
    goal?: string;
    sessionDuration?: string | number;
    trainingDaysPerWeek?: string | number;
    equipment?: string[];
    warmUp?: string;
    coolDown?: string;
    progressionTips?: string;
    exercises?: AiExercise[];
  };
};

const EMPTY_PROFILE: ProfileForm = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  height: '',
  weight: '',
  targetWeight: '',
  fitnessLevel: '',
  fitnessGoal: '',
  region: '',
  bio: '',
};

const REGION_OPTIONS = ['Africa', 'North America', 'South America', 'Europe', 'Asia', 'Australia'];

function normalizeDate(value: unknown) {
  if (!value) return '';
  try {
    return new Date(String(value)).toISOString().split('T')[0];
  } catch {
    return '';
  }
}

function regionFromTimezone(value: unknown) {
  const tz = String(value || '').toLowerCase();
  if (tz.includes('africa')) return 'Africa';
  if (tz.includes('america')) return tz.includes('sao') || tz.includes('argentina') || tz.includes('buenos') ? 'South America' : 'North America';
  if (tz.includes('europe')) return 'Europe';
  if (tz.includes('asia')) return 'Asia';
  if (tz.includes('australia')) return 'Australia';
  return '';
}

function unwrapUserProfile(response: any) {
  const user = response?.data || response?.user || response;
  const profile = user?.profile || response?.profile || {};
  return { user, profile };
}

function numberOrEmpty(value: unknown) {
  if (value === null || value === undefined || value === '') return '';
  return String(value);
}

function calculateBmi(weight: string, height: string) {
  const kg = Number(weight);
  const cm = Number(height);
  if (!Number.isFinite(kg) || !Number.isFinite(cm) || kg <= 0 || cm <= 0) return '';
  return (kg / ((cm / 100) ** 2)).toFixed(1);
}

function formatDate(value?: string) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

function readLocalAiPlan(): SavedAiPlan | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('flowfit_ai_plan');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function normalizeServerAiPlan(payload: any): SavedAiPlan | null {
  const data = payload?.data || payload?.program || payload?.plan || payload;
  if (!data || typeof data !== 'object') return null;
  const metadata = typeof data.metadata === 'string'
    ? (() => { try { return JSON.parse(data.metadata); } catch { return {}; } })()
    : data.metadata || {};
  const aiPlan = metadata.aiPlan || data.aiPlan || data;
  if (!aiPlan || (!aiPlan.exercises && !data.exercises && !aiPlan.workoutName && !data.title)) return null;
  return {
    serverSaved: true,
    savedAt: data.updatedAt || data.createdAt || aiPlan.generatedAt,
    name: data.title || data.name || aiPlan.workoutName,
    difficulty: data.difficulty || aiPlan.level,
    category: data.category || aiPlan.goal,
    exercises: data.exercises,
    aiPlan,
  };
}

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState<ProfileForm>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiPlan, setAiPlan] = useState<SavedAiPlan | null>(null);

  const fullName = `${form.firstName} ${form.lastName}`.trim() || user?.name || user?.fullName || 'FlowFit User';
  const initial = (fullName || user?.email || 'F')[0]?.toUpperCase() || 'F';
  const bmi = useMemo(() => calculateBmi(form.weight, form.height), [form.weight, form.height]);
  const ai = aiPlan?.aiPlan || {};
  const aiExercises = ai.exercises || aiPlan?.exercises || [];

  useEffect(() => {
    let active = true;

    async function boot() {
      try {
        const response = await UserAPI.getProfile();
        if (!active) return;
        const { user: serverUser, profile } = unwrapUserProfile(response);
        const nameParts = String(serverUser?.name || '').split(' ');
        const nextProfile: ProfileForm = {
          firstName: profile.firstName || nameParts[0] || '',
          lastName: profile.lastName || nameParts.slice(1).join(' ') || '',
          dateOfBirth: normalizeDate(profile.dateOfBirth || profile.dob),
          gender: profile.gender || '',
          height: numberOrEmpty(profile.height),
          weight: numberOrEmpty(profile.weight),
          targetWeight: numberOrEmpty(profile.targetWeight),
          fitnessLevel: profile.fitnessLevel || profile.activityLevel || '',
          fitnessGoal: profile.fitnessGoal || '',
          region: profile.region || regionFromTimezone(profile.timezone),
          bio: profile.bio || '',
        };
        setForm(nextProfile);
        if (serverUser && setUser) setUser(serverUser);
      } catch (error) {
        toast.error(sanitizeClientMessage(error, 'Failed to load profile.'));
      } finally {
        if (active) setLoading(false);
      }

      try {
        let plan: SavedAiPlan | null = null;
        if (ProgramsAPI?.getAiProgram) {
          plan = normalizeServerAiPlan(await ProgramsAPI.getAiProgram());
        }
        if (!plan) plan = readLocalAiPlan();
        if (active) setAiPlan(plan);
      } catch {
        if (active) setAiPlan(readLocalAiPlan());
      }
    }

    boot();
    function onStorage(event: StorageEvent) {
      if (event.key === 'flowfit_ai_plan') setAiPlan(readLocalAiPlan());
    }
    window.addEventListener('storage', onStorage);
    return () => {
      active = false;
      window.removeEventListener('storage', onStorage);
    };
  }, [setUser, toast]);

  function updateField(field: keyof ProfileForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function recordProfileWeightMetric() {
    if (!form.weight && !bmi) return;
    try {
      await UserAPI.updateMetrics({
        ...(form.weight ? { weight: form.weight } : {}),
        ...(bmi ? { bmi } : {}),
        notes: 'Logged from profile update',
      });
    } catch (error) {
      console.warn('[profile] Metric history save failed:', error);
      toast.warning('Profile saved, but weight history was not recorded.');
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const name = `${form.firstName} ${form.lastName}`.trim();
      const payload = {
        name,
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        height: form.height || undefined,
        weight: form.weight || undefined,
        targetWeight: form.targetWeight || undefined,
        fitnessLevel: form.fitnessLevel || undefined,
        fitnessGoal: form.fitnessGoal || undefined,
        region: form.region || undefined,
        bio: form.bio || undefined,
      };

      const response = await UserAPI.updateProfile(payload);
      const { user: updatedUser } = unwrapUserProfile(response);
      if (updatedUser && setUser) setUser(updatedUser);
      await recordProfileWeightMetric();
      toast.success('Profile updated successfully.');
    } catch (error) {
      toast.error(sanitizeClientMessage(error, 'Failed to update profile.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell>
      <section className={`page-section ${styles.profilePage}`}>
        <div className={styles.profileHero}>
          <div className={styles.profileHeroCopy}>
            <p className="eyebrow">Profile Settings</p>
            <h1>Profile Settings</h1>
            <p className="muted">Keep your details accurate so FlowFit can personalize coaching, meals, analytics, and generated plans.</p>
          </div>
          <div className={styles.profileIdentityCard}>
            <div className={styles.profileAvatar}>{initial}</div>
            <div className={styles.profileIdentityText}>
              <strong>{fullName}</strong>
              <span>{user?.email || 'Signed in FlowFit member'}</span>
              <em>{user?.plan || user?.role || 'FREE'} PLAN</em>
            </div>
          </div>
        </div>

        <form className={styles.profileForm} onSubmit={handleSave}>
          <div className={styles.formSection}>
            <div className={styles.sectionTitleRow}>
              <User size={18} />
              <h2>Personal Information</h2>
            </div>
            <div className={styles.formGrid}>
              <label className={styles.formGroup}>
                <span>First Name</span>
                <input value={form.firstName} onChange={(event) => updateField('firstName', event.target.value)} placeholder="John" autoComplete="given-name" disabled={loading || saving} />
              </label>
              <label className={styles.formGroup}>
                <span>Last Name</span>
                <input value={form.lastName} onChange={(event) => updateField('lastName', event.target.value)} placeholder="Doe" autoComplete="family-name" disabled={loading || saving} />
              </label>
              <label className={styles.formGroup}>
                <span>Date of Birth</span>
                <input type="date" value={form.dateOfBirth} onChange={(event) => updateField('dateOfBirth', event.target.value)} disabled={loading || saving} />
              </label>
              <label className={styles.formGroup}>
                <span>Gender</span>
                <select value={form.gender} onChange={(event) => updateField('gender', event.target.value)} disabled={loading || saving}>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.sectionTitleRow}>
              <Activity size={18} />
              <h2>Fitness Details</h2>
            </div>
            <div className={styles.formGrid}>
              <label className={styles.formGroup}>
                <span>Height (cm)</span>
                <input type="number" min="80" max="260" value={form.height} onChange={(event) => updateField('height', event.target.value)} placeholder="175" disabled={loading || saving} />
              </label>
              <label className={styles.formGroup}>
                <span>Weight (kg)</span>
                <input type="number" min="20" max="350" step="0.1" value={form.weight} onChange={(event) => updateField('weight', event.target.value)} placeholder="70" disabled={loading || saving} />
              </label>
              <label className={styles.formGroup}>
                <span>Target Weight (kg)</span>
                <input type="number" min="20" max="350" step="0.1" value={form.targetWeight} onChange={(event) => updateField('targetWeight', event.target.value)} placeholder="65" disabled={loading || saving} />
              </label>
              <label className={styles.formGroup}>
                <span>Fitness Level</span>
                <select value={form.fitnessLevel} onChange={(event) => updateField('fitnessLevel', event.target.value)} disabled={loading || saving}>
                  <option value="">Select Level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>
              <label className={styles.formGroup}>
                <span>Fitness Goal</span>
                <input value={form.fitnessGoal} onChange={(event) => updateField('fitnessGoal', event.target.value)} placeholder="Lose weight, Build muscle, etc." disabled={loading || saving} />
              </label>
              <label className={styles.formGroup}>
                <span>Region</span>
                <select value={form.region} onChange={(event) => updateField('region', event.target.value)} disabled={loading || saving}>
                  <option value="">Select Region</option>
                  {REGION_OPTIONS.map((region) => <option key={region} value={region}>{region}</option>)}
                </select>
              </label>
            </div>

            <div className={styles.metricPreviewGrid}>
              <div className={styles.metricPreviewCard}><Scale size={16} /><span>BMI</span><strong>{bmi || '—'}</strong></div>
              <div className={styles.metricPreviewCard}><Target size={16} /><span>Goal</span><strong>{form.fitnessGoal || 'Not set'}</strong></div>
              <div className={styles.metricPreviewCard}><MapPin size={16} /><span>Region</span><strong>{form.region || 'Not set'}</strong></div>
              <div className={styles.metricPreviewCard}><CalendarDays size={16} /><span>Saved plan</span><strong>{aiPlan ? 'Available' : 'None'}</strong></div>
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.sectionTitleRow}>
              <Sparkles size={18} />
              <h2>About You</h2>
            </div>
            <label className={styles.formGroup}>
              <span>Bio</span>
              <textarea value={form.bio} onChange={(event) => updateField('bio', event.target.value)} placeholder="Tell us about yourself..." disabled={loading || saving} />
            </label>
          </div>

          <button type="submit" className={`primary-btn ${styles.saveButton}`} disabled={loading || saving}>
            <Save size={16} />
            {saving ? 'Saving Profile...' : 'Save Profile'}
          </button>
        </form>

        <section className={styles.aiPlanSection}>
          <div className={styles.aiPlanHeader}>
            <div className={styles.aiPlanHeaderLeft}>
              <div className={styles.aiPlanIcon}>✨</div>
              <div>
                <h2>AI Generated Workout Plan</h2>
                <p>Saved from dashboard · New saves replace this</p>
              </div>
            </div>
            <div className={styles.aiPlanBadges}>
              {aiPlan ? (
                <>
                  <span className={aiPlan.serverSaved ? styles.syncedBadge : styles.localBadge}>{aiPlan.serverSaved ? '✓ Synced' : 'Local only'}</span>
                  {(ai.level || aiPlan.difficulty) && <span>{ai.level || aiPlan.difficulty}</span>}
                </>
              ) : null}
            </div>
          </div>

          <div className={styles.aiPlanBody}>
            {!aiPlan ? (
              <div className={styles.aiPlanEmpty}>
                <div>🤖</div>
                <h3>No AI plan saved yet</h3>
                <p>Go to your dashboard, generate a personalised workout plan and save it. It will appear here instantly.</p>
                <Link href="/dashboard" className={styles.aiPlanEmptyCta}>✨ Open Dashboard</Link>
              </div>
            ) : (
              <>
                <div className={styles.aiPlanNameRow}>
                  <h3>{ai.workoutName || aiPlan.name || 'AI Workout'}</h3>
                  {ai.focus && <span>{ai.focus}</span>}
                  {aiPlan.savedAt && <em>Saved {formatDate(aiPlan.savedAt)}</em>}
                </div>

                <div className={styles.aiPlanChips}>
                  {(ai.goal || aiPlan.category) && <span>🎯 <b>{ai.goal || aiPlan.category}</b></span>}
                  {ai.sessionDuration && <span>⏱ <b>{ai.sessionDuration} min</b> sessions</span>}
                  {ai.trainingDaysPerWeek && <span>📅 <b>{ai.trainingDaysPerWeek} days</b> / week</span>}
                  {ai.equipment?.length ? <span>🏋️ {ai.equipment.join(', ')}</span> : null}
                </div>

                {ai.warmUp && <div className={styles.aiPlanBox}><strong>Warm-Up</strong><p>{ai.warmUp}</p></div>}

                {aiExercises.length > 0 && (
                  <>
                    <p className={styles.aiPlanExerciseLabel}>Exercises</p>
                    <div className={styles.aiPlanExerciseGrid}>
                      {aiExercises.map((exercise, index) => (
                        <article key={`${exercise.name || 'exercise'}-${index}`} className={styles.aiPlanExerciseCard}>
                          <span>Exercise {index + 1}</span>
                          <h4>{exercise.name || 'Exercise'}</h4>
                          <div>
                            {exercise.sets && <em>{exercise.sets} sets</em>}
                            {exercise.reps && <em>{exercise.reps} reps</em>}
                            {exercise.restSeconds && <em>{exercise.restSeconds}s rest</em>}
                          </div>
                          {exercise.notes && <p>{exercise.notes}</p>}
                        </article>
                      ))}
                    </div>
                  </>
                )}

                {ai.coolDown && <div className={styles.aiPlanBox}><strong>Cool-Down</strong><p>{ai.coolDown}</p></div>}
                {ai.progressionTips && <div className={styles.aiPlanBox}><strong>Progression Strategy</strong><p>{ai.progressionTips}</p></div>}
              </>
            )}
          </div>
        </section>
      </section>
    </DashboardShell>
  );
}
