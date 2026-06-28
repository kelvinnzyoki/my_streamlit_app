'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bot,
  Clock,
  Dumbbell,
  Flame,
  Grid3X3,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import ProgressChart from '@/components/progressChart';
import { getDashboard, getProgress, getWorkouts } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import type { Workout } from '@/types/workout';

const QUICK_NAV = [
  { label: 'Workouts', href: '/workouts', Icon: Dumbbell, copy: 'Start a protected server session' },
  { label: 'Programs', href: '/programs', Icon: Grid3X3, copy: 'View your server plans' },
  { label: 'Progress', href: '/progress', Icon: BarChart3, copy: 'Track real workout logs' },
] as const;

type WPointsResponse = {
  success?: boolean;
  data?: {
    total?: number;
    points?: number;
  };
  total?: number;
  points?: number;
};

type StreakResponse = {
  success?: boolean;
  data?: {
    currentStreak?: number;
    longestStreak?: number;
    lastWorkoutDate?: string | null;
  };
};

function buildApiUrl(path: string) {
  const rawBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const base = rawBase.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (!base) return cleanPath;
  if (base.endsWith('/api/v1') && cleanPath.startsWith('/api/v1/')) {
    return `${base}${cleanPath.replace('/api/v1', '')}`;
  }

  return `${base}${cleanPath}`;
}

function getClientAuthToken() {
  if (typeof window === 'undefined') return null;

  return (
    window.sessionStorage.getItem('access_token') ||
    window.sessionStorage.getItem('accessToken') ||
    window.sessionStorage.getItem('token') ||
    window.sessionStorage.getItem('ff_access_token') ||
    window.localStorage.getItem('access_token') ||
    window.localStorage.getItem('accessToken') ||
    window.localStorage.getItem('token') ||
    window.localStorage.getItem('ff_access_token')
  );
}

function authHeaders() {
  const token = getClientAuthToken();
  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function getStreakData() {
  const res = await fetch(buildApiUrl('/api/v1/progress/streaks'), {
    method: 'GET',
    credentials: 'include',
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error('Failed to fetch streaks.');

  const payload = (await res.json()) as StreakResponse;
  const currentStreak = Number(payload?.data?.currentStreak ?? 0);
  const longestStreak = Number(payload?.data?.longestStreak ?? 0);

  return {
    currentStreak: Number.isFinite(currentStreak) ? currentStreak : 0,
    longestStreak: Number.isFinite(longestStreak) ? longestStreak : 0,
  };
}

async function getWPointsTotal() {
  const res = await fetch(buildApiUrl('/api/v1/progress/w-points'), {
    method: 'GET',
    credentials: 'include',
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error('Failed to fetch W Points.');

  const payload = (await res.json()) as WPointsResponse;
  const total = payload?.data?.total ?? payload?.data?.points ?? payload?.total ?? payload?.points ?? 1;
  return Number.isFinite(Number(total)) ? Number(total) : 1;
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [featured, setFeatured] = useState<Workout[]>([]);
  const [wPoints, setWPoints] = useState<number>(1);
  const [serverStreak, setServerStreak] = useState<{ currentStreak: number; longestStreak: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [pointsLoading, setPointsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.all([getDashboard(), getProgress('7d'), getWorkouts()])
      .then(([d, p, w]) => {
        if (!active) return;
        setDashboard(d);
        setProgress(p);
        setFeatured(Array.isArray(w) ? w.slice(0, 3) : []);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    getStreakData()
      .then((streak) => {
        if (active) setServerStreak(streak);
      })
      .catch(() => {
        if (active) setServerStreak(null);
      });

    getWPointsTotal()
      .then((points) => {
        if (active) setWPoints(points);
      })
      .catch(() => {
        if (active) setWPoints(1);
      })
      .finally(() => {
        if (active) setPointsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const stats = dashboard?.stats || dashboard?.summary || dashboard || {};
  const streaks = dashboard?.streak || dashboard?.streaks || stats?.streaks || {};
  const summary = progress?.summary || {};
  const weekly: number[] = progress?.weekly || progress?.daily || dashboard?.weekly || stats?.weekly || [];

  const streakValue =
    serverStreak?.currentStreak ??
    stats.currentStreak ?? stats.streak ?? stats.totalStreak ??
    streaks.currentStreak ?? streaks.streak ?? streaks.totalStreak ??
    summary.streak ?? 0;

  const workoutValue =
    stats.completedWorkouts ?? stats.totalWorkouts ?? stats.workouts ?? stats.sessions ??
    summary.workouts ?? summary.sessions ?? 0;

  const minuteValue =
    stats.totalMinutes ?? stats.minutes ?? stats.totalDuration ?? stats.durationMinutes ??
    stats.workoutMinutes ?? summary.minutes ?? summary.totalMinutes ?? 0;

  const calorieValue =
    stats.totalCalories ?? stats.calories ?? stats.caloriesBurned ??
    summary.calories ?? summary.totalCalories ?? 0;

  const statCards = [
    { label: 'Streak', value: streakValue, unit: 'days', Icon: Trophy },
    { label: 'Workouts Done', value: workoutValue, unit: 'sessions', Icon: Dumbbell },
    { label: 'Total Minutes', value: minuteValue, unit: 'min', Icon: Clock },
    { label: 'Calories Burned', value: calorieValue, unit: 'kcal', Icon: Flame },
  ];

  return (
    <DashboardShell>
      <section className="page-section dashboard-elite">
        <div className="dashboard-hero-strip">
          <div className="dashboard-hero-copy">
            <p className="eyebrow">Dashboard</p>
            <h1>Your FlowFit Control Centre</h1>
            <p className="muted">
              Server-powered workout data, progress analytics, AI coaching, and program management
              in one premium protected workspace.
            </p>
          </div>

          <div className="dashboard-hero-orbit" aria-hidden="true">
            <span />
            <strong>{loading ? '—' : formatNumber(workoutValue)}</strong>
            <small>sessions</small>
          </div>
        </div>

        <div className="grid grid-4 elite-stat-grid">
          {statCards.map(({ label, value, unit, Icon }) => (
            <div key={label} className="stat-card elite-stat-card">
              <div className="elite-stat-icon"><Icon size={18} /></div>
              <div className="stat-value">{loading ? '—' : formatNumber(value)}</div>
              <p className="stat-label">{label}</p>
              <small>{unit}</small>
            </div>
          ))}
        </div>

        <div className="grid grid-2 dashboard-ai-grid">
          <Link href="/coach" className="premium-card dashboard-ai-card dashboard-ai-coach-card">
            <div className="dashboard-ai-icon"><Bot size={24} /></div>
            <div>
              <p className="eyebrow">AI Personal Coach</p>
              <h2>Get coaching that feels personal</h2>
              <p className="muted">
                Ask about form, recovery, motivation, nutrition direction, and the best next workout
                based on your FlowFit activity.
              </p>
            </div>
            <span className="dashboard-ai-cta">
              Open Coach <ArrowRight size={16} />
            </span>
          </Link>

          <Link href="/generate-plan" className="premium-card dashboard-ai-card dashboard-ai-plan-card">
            <div className="dashboard-ai-icon"><Sparkles size={24} /></div>
            <div>
              <p className="eyebrow">Generate Workout Plan</p>
              <h2>Create a fresh training plan</h2>
              <p className="muted">
                Generate goal-based workouts from your level, time, focus, and equipment. Save the plan
                to continue training from your dashboard.
              </p>
            </div>
            <span className="dashboard-ai-cta">
              Generate Plan <ArrowRight size={16} />
            </span>
          </Link>
        </div>

        <div className="quick-nav quick-nav-artistic">
          {QUICK_NAV.map(({ label, href, Icon, copy }) => (
            <Link key={href} href={href} className="quick-nav-card">
              <Icon size={22} />
              <span>{label}</span>
              <small>{copy}</small>
            </Link>
          ))}
        </div>

        <div className="grid grid-2 dashboard-lower-grid">
          <div className="premium-card artistic-panel">
            <div className="panel-headline">
              <div>
                <p className="eyebrow">Analytics</p>
                <h2>Weekly Activity</h2>
              </div>
              <Link href="/progress">View all →</Link>
            </div>
            <ProgressChart values={weekly} label="Sessions" />
          </div>

          <div className="premium-card artistic-panel">
            <div className="panel-headline">
              <div>
                <p className="eyebrow">Quick Start</p>
                <h2>Server Workouts</h2>
              </div>
              <Link href="/workouts">All workouts →</Link>
            </div>

            {featured.length > 0 ? (
              <div className="dashboard-workout-stack">
                {featured.map((w) => (
                  <Link key={w.id} href={`/workouts/session?id=${w.slug || w.id}`} className="mini-link workout-art-link">
                    <div>
                      <strong>{w.name}</strong>
                      <p className="muted" style={{ margin: 0, fontSize: '0.78rem' }}>{w.category || w.level || 'Workout'}</p>
                    </div>
                    <span>{w.duration || 10} min</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="dashboard-empty-state">
                <Zap size={20} />
                <p className="muted">Server workout recommendations will appear here after your first logs.</p>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-wpoints-wrap">
          <div className="premium-card artistic-panel wpoints-card">
            <div className="panel-headline wpoints-headline">
              <div>
                <p className="eyebrow">Rewards</p>
                <h2>W Points</h2>
              </div>
              <span className="wpoints-badge">{pointsLoading ? '—' : `${formatNumber(wPoints)} W`}</span>
            </div>

            <div className="wpoints-total-row wpoints-total-only" aria-label="W Points balance">
              <div className="wpoints-circle">
                <span className="wpoints-number">{pointsLoading ? '—' : formatNumber(wPoints)}</span>
                <span className="wpoints-label">W POINTS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .dashboard-wpoints-wrap {
          margin-top: 1.5rem;
          display: grid;
          grid-template-columns: minmax(0, 1fr);
        }

        .wpoints-card {
          background: linear-gradient(145deg, var(--surface, rgba(15, 14, 24, 0.88)), var(--surface-deep, rgba(3, 3, 3, 0.92))) !important;
          border-color: var(--Au-rim, rgba(212, 175, 55, 0.22)) !important;
          overflow: hidden;
          position: relative;
        }

        .wpoints-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 20% 0%, var(--Au-10, rgba(212, 175, 55, 0.10)), transparent 34%),
            radial-gradient(circle at 82% 80%, rgba(91, 156, 246, 0.08), transparent 38%);
          pointer-events: none;
        }

        .wpoints-headline,
        .wpoints-total-row {
          position: relative;
          z-index: 1;
        }

        .wpoints-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--Au-hi, #E8C96A);
          background: var(--Au-12, rgba(212, 175, 55, 0.12));
          border: 1px solid var(--Au-28, rgba(212, 175, 55, 0.28));
          border-radius: 20px;
          padding: 0.18rem 0.7rem;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }

        .wpoints-total-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          padding: 1.25rem 0 0.75rem;
        }

        .wpoints-circle {
          width: 86px;
          height: 86px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--Au-14, rgba(212, 175, 55, 0.14)) 0%, var(--Au-04, rgba(212, 175, 55, 0.04)) 60%, transparent 100%);
          border: 1.5px solid var(--Au-38, rgba(212, 175, 55, 0.38));
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.1rem;
          flex-shrink: 0;
          box-shadow: 0 0 24px var(--Au-12, rgba(212, 175, 55, 0.12));
        }

        .wpoints-number {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.9rem;
          font-weight: 700;
          line-height: 1;
          background: linear-gradient(135deg, var(--Au-hi, #E8C96A), var(--Au, #C9A84C), var(--Au-lo, #8E6E28));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .wpoints-label {
          font-family: 'Josefin Sans', sans-serif;
          font-weight: 200;
          font-size: 0.52rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--t2, #8A8590);
        }

        @media (min-width: 900px) {
          .dashboard-wpoints-wrap {
            grid-template-columns: minmax(320px, 0.5fr);
          }
        }
      `}</style>
    </DashboardShell>
  );
}
