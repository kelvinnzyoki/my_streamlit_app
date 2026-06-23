'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BarChart3,
  CalendarDays,
  Flame,
  Gauge,
  History,
  Loader2,
  Medal,
  RefreshCcw,
  Timer,
  Trophy,
  Zap,
} from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import { ProgressAPI, UserAPI } from '@/lib/api';
import styles from './progress.module.css';
import Footer from '@/components/footer';

type Period = '7d' | '30d' | '90d';
type ApiResult<T = any> = { success?: boolean; data?: T; [key: string]: any } | T;

type WorkoutLog = {
  id?: string;
  date?: string;
  createdAt?: string;
  duration?: number;
  caloriesBurned?: number | null;
  sets?: number | null;
  reps?: number | null;
  difficulty?: string | null;
  exercise?: {
    name?: string;
    category?: string;
  } | null;
  exerciseName?: string;
  category?: string;
};

type Achievement = {
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  points?: number;
  unlocked?: boolean;
  unlockedAt?: string | null;
  requirement?: any;
};

type MetricSnapshot = {
  id?: string;
  date?: string;
  weight?: number | string | null;
  bmi?: number | string | null;
  bodyFat?: number | string | null;
  body_fat?: number | string | null;
  muscleMass?: number | string | null;
  muscle_mass?: number | string | null;
  restingHeartRate?: number | string | null;
  resting_heart_rate?: number | string | null;
};

type UserProfilePayload = {
  weight?: number | string | null;
  height?: number | string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  dob?: string | null;
  profile?: {
    weight?: number | string | null;
    height?: number | string | null;
    gender?: string | null;
    dateOfBirth?: string | null;
    dob?: string | null;
  } | null;
};

const PERIODS: Array<{ label: string; value: Period }> = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
];

function unwrapData<T = any>(payload: ApiResult<T>): any {
  if (!payload) return null;
  if (typeof payload === 'object' && 'data' in payload) return (payload as any).data;
  return payload;
}

function asArray(payload: any, keys: string[] = []): any[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  for (const key of keys) if (Array.isArray(payload[key])) return payload[key];
  if (payload.data) return asArray(payload.data, keys);
  return [];
}

function numberValue(value: any, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatNumber(value: any): string {
  return Math.round(numberValue(value)).toLocaleString('en-KE');
}

function formatDuration(minutes: any): string {
  const total = Math.max(0, Math.round(numberValue(minutes)));
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function formatDate(raw?: string | null): string {
  if (!raw) return '—';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function dateKey(raw?: string | null): string {
  if (!raw) return '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function niceCategory(value?: string | null): string {
  const raw = String(value || 'General').replace(/_/g, ' ').toLowerCase();
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function getLogName(log: WorkoutLog): string {
  return log.exercise?.name || log.exerciseName || 'Workout';
}

function getLogCategory(log: WorkoutLog): string {
  return log.exercise?.category || log.category || 'General';
}

function getRequirementText(requirement: any): string {
  if (!requirement) return 'Complete FlowFit activity to unlock.';
  try {
    const req = typeof requirement === 'string' ? JSON.parse(requirement) : requirement;
    if (!req || typeof req !== 'object') return 'Complete FlowFit activity to unlock.';
    const target = req.value ?? req.count ?? req.target ?? req.workouts ?? req.calories ?? req.duration ?? req.streak ?? req.sessions;
    const metric = String(req.type || req.field || req.metric || req.category || 'workouts').replace(/_/g, ' ');
    return target ? `Reach ${target} ${metric}.` : `Complete ${metric}.`;
  } catch {
    return 'Complete FlowFit activity to unlock.';
  }
}

function buildSeries(period: Period, byDate: Record<string, number>, logs: WorkoutLog[]) {
  const days = period === '7d' ? 7 : period === '90d' ? 14 : 10;
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (days - 1 - i));
    const key = d.toISOString().slice(0, 10);
    const fallback = logs.filter((log) => dateKey(log.date || log.createdAt) === key).length;
    return {
      key,
      label: d.toLocaleDateString('en-KE', { weekday: days <= 7 ? 'short' : undefined, day: 'numeric', month: days > 7 ? 'short' : undefined }),
      value: numberValue(byDate[key], fallback),
    };
  });
}

function buildTrend(logs: WorkoutLog[]) {
  const grouped = new Map<string, { calories: number; duration: number }>();
  logs.slice().reverse().forEach((log) => {
    const key = dateKey(log.date || log.createdAt);
    if (!key) return;
    const current = grouped.get(key) || { calories: 0, duration: 0 };
    current.calories += numberValue(log.caloriesBurned);
    current.duration += numberValue(log.duration);
    grouped.set(key, current);
  });
  return Array.from(grouped.entries()).slice(-10).map(([key, value]) => ({
    key,
    label: new Date(key).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }),
    ...value,
  }));
}

function getAgeFromProfile(profile?: UserProfilePayload | null): number {
  const raw = profile?.profile?.dateOfBirth || profile?.profile?.dob || profile?.dateOfBirth || profile?.dob;
  if (!raw) return 30;
  const birthDate = new Date(raw);
  if (Number.isNaN(birthDate.getTime())) return 30;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) age -= 1;
  return Math.max(13, Math.min(90, age));
}

function calculateBmi(weight: number, heightCm: number): number {
  if (!weight || !heightCm) return 0;
  const heightM = heightCm / 100;
  return heightM > 0 ? weight / (heightM * heightM) : 0;
}

function estimateBodyFat(bmi: number, profile?: UserProfilePayload | null): number {
  if (!bmi) return 0;
  const age = getAgeFromProfile(profile);
  const gender = String(profile?.profile?.gender || profile?.gender || '').toLowerCase();
  const sexConstant = gender.startsWith('male') || gender === 'm' ? 16.2 : 5.4;
  return Math.max(4, Math.min(60, 1.2 * bmi + 0.23 * age - sexConstant));
}

function calculateBio(metrics: MetricSnapshot[], history: WorkoutLog[], profile?: UserProfilePayload | null) {
  const sorted = [...metrics].sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime());
  const latest = sorted[0];
  const oldest = sorted[sorted.length - 1];
  const profileData = profile?.profile || profile || {};

  const weight = numberValue(latest?.weight, numberValue((profileData as any).weight, 0));
  const height = numberValue((profileData as any).height, 0);
  const bmi = numberValue(latest?.bmi, calculateBmi(weight, height));
  const savedBodyFat = numberValue(latest?.bodyFat ?? latest?.body_fat, 0);
  const bodyFat = savedBodyFat || estimateBodyFat(bmi, profile);
  const bodyFatSource = savedBodyFat ? 'Latest saved estimate' : bodyFat ? 'Estimated from BMI profile data' : 'Add body metrics in profile';
  const trend = weight && oldest?.weight ? weight - numberValue(oldest.weight) : 0;
  const workouts = history.length;
  const minutes = history.reduce((sum, log) => sum + numberValue(log.duration), 0);
  const scoreParts = [
    bmi ? Math.max(0, Math.min(100, 100 - Math.abs(bmi - 22) * 6)) : 0,
    bodyFat ? Math.max(0, Math.min(100, 100 - Math.abs(bodyFat - 18) * 3)) : 0,
    Math.min(100, workouts * 7),
    Math.min(100, minutes / 8),
  ];
  const score = Math.round(scoreParts.reduce((a, b) => a + b, 0) / scoreParts.filter(Boolean).length || 0);
  let bmiCategory = '—';
  if (bmi) {
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi < 25) bmiCategory = 'Healthy';
    else if (bmi < 30) bmiCategory = 'Overweight';
    else bmiCategory = 'Obese';
  }
  return { weight, height, bmi, bodyFat, bodyFatSource, trend, score, bmiCategory, scoreParts };
}

function BarChart({ data }: { data: Array<{ label: string; value: number; key?: string }> }) {
  const max = Math.max(1, ...data.map((item) => item.value));
  return (
    <div className={styles.barChart}>
      {data.map((item, index) => (
        <div className={styles.barItem} key={item.key ?? `${item.label}-${index}`}>
          <span className={styles.barValue}>{item.value}</span>
          <div className={styles.barTrack}>
            <div className={styles.barFill} style={{ height: `${Math.max(8, (item.value / max) * 100)}%` }} />
          </div>
          <span className={styles.barLabel}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function CategoryChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data || {}).sort((a, b) => b[1] - a[1]).slice(0, 7);
  const max = Math.max(1, ...entries.map(([, count]) => count));
  if (!entries.length) return <p className={styles.empty}>No categories yet. Log workouts to build this chart.</p>;
  return (
    <div className={styles.categoryRows}>
      {entries.map(([category, count]) => (
        <div className={styles.categoryRow} key={category}>
          <span className={styles.categoryLabel}>{niceCategory(category)}</span>
          <div className={styles.categoryTrack}>
            <div className={styles.categoryFill} style={{ width: `${Math.max(8, (count / max) * 100)}%` }} />
          </div>
          <strong>{count}</strong>
        </div>
      ))}
    </div>
  );
}

function TrendChart({ data }: { data: Array<{ label: string; calories: number; duration: number }> }) {
  const max = Math.max(1, ...data.flatMap((item) => [item.calories, item.duration]));
  if (!data.length) return <p className={styles.empty}>Progress trend appears after your first logged sessions.</p>;
  return (
    <div className={styles.trendChart}>
      {data.map((item) => (
        <div className={styles.trendColumn} key={item.label}>
          <div className={styles.trendBars}>
            <span className={styles.calorieBar} style={{ height: `${Math.max(8, (item.calories / max) * 100)}%` }} />
            <span className={styles.minuteBar} style={{ height: `${Math.max(8, (item.duration / max) * 100)}%` }} />
          </div>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function ProgressPage() {
  const [period, setPeriod] = useState<Period>('30d');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<any>({});
  const [history, setHistory] = useState<WorkoutLog[]>([]);
  const [streak, setStreak] = useState<any>({});
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [metrics, setMetrics] = useState<MetricSnapshot[]>([]);
  const [profile, setProfile] = useState<UserProfilePayload | null>(null);

  async function loadProgress(nextPeriod = period, recalculate = false) {
    setError('');
    if (recalculate) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsRes, historyRes, streakRes, achievementRes, metricRes, profileRes] = await Promise.all([
        ProgressAPI.getStats(nextPeriod),
        ProgressAPI.getWorkoutHistory(nextPeriod === '90d' ? 90 : 30),
        ProgressAPI.getStreaks(),
        recalculate && ProgressAPI.recalculateAchievements ? ProgressAPI.recalculateAchievements() : ProgressAPI.getAchievements(),
        UserAPI.getMetricsHistory ? UserAPI.getMetricsHistory(60).catch(() => ({ success: true, data: [] })) : Promise.resolve({ success: true, data: [] }),
        UserAPI.getProfile ? UserAPI.getProfile().catch(() => ({ success: true, data: null })) : Promise.resolve({ success: true, data: null }),
      ]);

      setStats(unwrapData(statsRes) || {});
      setHistory(asArray(unwrapData(historyRes) || historyRes, ['history', 'logs', 'workouts', 'items']));
      setStreak(unwrapData(streakRes) || {});
      setAchievements(asArray(unwrapData(achievementRes) || achievementRes, ['achievements', 'items']).map((a) => ({ ...a })));
      setMetrics(asArray(unwrapData(metricRes) || metricRes, ['metrics', 'items']));
      setProfile(unwrapData(profileRes) || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadProgress(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const byDate = stats.byDate || stats.daily || {};
  const byCategory = stats.byCategory || stats.categories || {};
  const frequency = useMemo(() => buildSeries(period, byDate, history), [period, byDate, history]);
  const trend = useMemo(() => buildTrend(history), [history]);
  const bio = useMemo(() => calculateBio(metrics, history, profile), [metrics, history, profile]);

  const unlockedAchievements = achievements.filter((item) => item.unlocked);
  const visibleAchievements = achievements.length ? [...achievements].sort((a, b) => Number(b.unlocked) - Number(a.unlocked)).slice(0, 8) : [];

  const statCards = [
    { label: 'Total Workouts', value: stats.totalWorkouts ?? history.length, icon: Zap, sub: `${period} training volume` },
    { label: 'Calories Burned', value: stats.totalCalories ?? history.reduce((s, l) => s + numberValue(l.caloriesBurned), 0), icon: Flame, sub: 'Estimated kcal' },
    { label: 'Training Time', value: formatDuration(stats.totalDuration ?? history.reduce((s, l) => s + numberValue(l.duration), 0)), icon: Timer, sub: 'Logged minutes' },
    { label: 'Avg Duration', value: formatDuration(stats.avgDuration ?? 0), icon: Gauge, sub: 'Average session' },
  ];

  return (
    <DashboardShell>
      <section className={styles.page}>
        <header className={styles.header}>
          <div>
            <p className="eyebrow">Progress</p>
            <h1>Your Performance Dashboard</h1>
            <p className="muted">Track consistency, calories, streaks, biometric trends, workout history, and unlocked achievements.</p>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.periodTabs}>
              {PERIODS.map((item) => (
                <button key={item.value} className={period === item.value ? styles.activePeriod : ''} onClick={() => setPeriod(item.value)} type="button">
                  {item.label}
                </button>
              ))}
            </div>
            <button className={styles.refreshBtn} onClick={() => loadProgress(period, true)} type="button" disabled={refreshing}>
              {refreshing ? <Loader2 size={16} className={styles.spin} /> : <RefreshCcw size={16} />}
              Refresh
            </button>
          </div>
        </header>

        {error ? <div className={styles.errorBox}>{error}</div> : null}

        <div className={styles.statsGrid}>
          {statCards.map(({ label, value, icon: Icon, sub }) => (
            <article className={styles.statCard} key={label}>
              <div className={styles.statHead}>
                <span>{label}</span>
                <Icon size={20} />
              </div>
              <strong>{loading ? '—' : typeof value === 'number' ? formatNumber(value) : value}</strong>
              <p>{sub}</p>
            </article>
          ))}
        </div>

        <div className={styles.streakGrid}>
          <article className={styles.streakCard}>
            <Trophy size={26} />
            <strong>{loading ? '—' : formatNumber(streak.currentStreak ?? 0)}</strong>
            <span>Current Streak</span>
            <p>Last workout: {formatDate(streak.lastWorkoutDate)}</p>
          </article>
          <article className={styles.streakCard}>
            <Medal size={26} />
            <strong>{loading ? '—' : formatNumber(streak.longestStreak ?? 0)}</strong>
            <span>Longest Streak</span>
            <p>Keep showing up to beat your best.</p>
          </article>
        </div>

        <div className={styles.chartGrid}>
          <article className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <div>
                <h2>Workout Frequency</h2>
                <p>Sessions grouped by date</p>
              </div>
              <CalendarDays size={22} />
            </div>
            <BarChart data={frequency} />
          </article>

          <article className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <div>
                <h2>Category Breakdown</h2>
                <p>Training focus by workout category</p>
              </div>
              <BarChart3 size={22} />
            </div>
            <CategoryChart data={byCategory} />
          </article>
        </div>

        <article className={styles.bioSection}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Advanced Analytics</h2>
              <p>Computed from your profile, body metrics history, and workout data.</p>
            </div>
            <Gauge size={22} />
          </div>
          <div className={styles.bioGrid}>
            <div className={styles.bioCard}><span>⚖️</span><p>Current BMI</p><strong>{bio.bmi ? bio.bmi.toFixed(1) : '—'}</strong><small>Latest body metric</small></div>
            <div className={styles.bioCard}><span>📊</span><p>BMI Category</p><strong>{bio.bmiCategory}</strong><small>WHO-style classification</small></div>
            <div className={styles.bioCard}><span>📉</span><p>Weight Trend</p><strong>{bio.trend ? `${bio.trend > 0 ? '+' : ''}${bio.trend.toFixed(1)} kg` : '—'}</strong><small>{bio.weight ? `Current ${bio.weight} kg` : 'Add metrics in profile'}</small></div>
            <div className={styles.bioCard}><span>🔬</span><p>Body Fat</p><strong>{bio.bodyFat ? `${bio.bodyFat.toFixed(1)}%` : '—'}</strong><small>{bio.bodyFatSource}</small></div>
            <div className={`${styles.bioCard} ${styles.scoreCard}`}>
              <span>🏆</span><p>Fitness Score</p><strong>{bio.score || '—'}</strong>
              <div className={styles.scoreTrack}><i style={{ width: `${Math.min(100, bio.score)}%` }} /></div>
            </div>
          </div>
        </article>

        <article className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Progress Trend</h2>
              <p>Calories burned and duration over recent sessions</p>
            </div>
            <div className={styles.legend}><span /> Calories <i /> Duration</div>
          </div>
          <TrendChart data={trend} />
        </article>

        <div className={styles.bottomGrid}>
          <article className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <div>
                <h2>Workout History</h2>
                <p>Recent logged sessions</p>
              </div>
              <History size={22} />
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.historyTable}>
                <thead>
                  <tr><th>Workout</th><th>Category</th><th>Duration</th><th>Calories</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {history.length ? history.slice(0, 12).map((log, index) => (
                    <tr key={log.id || `${getLogName(log)}-${index}`}>
                      <td className={styles.workoutName}>{getLogName(log)}</td>
                      <td><span className={styles.workoutBadge}>{niceCategory(getLogCategory(log))}</span></td>
                      <td>{formatDuration(log.duration)}</td>
                      <td>{formatNumber(log.caloriesBurned ?? 0)}</td>
                      <td>{formatDate(log.date || log.createdAt)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className={styles.empty}>No workout history yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <article className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <div>
                <h2>Achievements</h2>
                <p>{unlockedAchievements.length} unlocked milestone{unlockedAchievements.length === 1 ? '' : 's'}</p>
              </div>
              <Award size={22} />
            </div>
            <div className={styles.achievementGrid}>
              {visibleAchievements.length ? visibleAchievements.map((achievement) => (
                <div className={`${styles.achievementItem} ${achievement.unlocked ? styles.unlocked : styles.locked}`} key={achievement.id || achievement.name}>
                  <div>
                    <strong>{achievement.name || achievement.title || 'Achievement'}</strong>
                    {achievement.unlocked ? <span>Completed</span> : null}
                  </div>
                  <p>{achievement.description || getRequirementText(achievement.requirement)}</p>
                  <small>{achievement.points ?? 0} pts {achievement.unlockedAt ? `· ${formatDate(achievement.unlockedAt)}` : ''}</small>
                </div>
              )) : <p className={styles.empty}>No achievements returned yet.</p>}
            </div>
          </article>
        </div>
      </section>
    </DashboardShell>

    <Footer />
  );
}
