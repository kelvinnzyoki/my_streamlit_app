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
import Footer from '@/components/footer';

const QUICK_NAV = [
  { label: 'Workouts', href: '/workouts', Icon: Dumbbell, copy: 'Start a protected server session' },
  { label: 'Programs', href: '/programs', Icon: Grid3X3, copy: 'View your server plans' },
  { label: 'Progress', href: '/progress', Icon: BarChart3, copy: 'Track real workout logs' },
] as const;

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [featured, setFeatured] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboard(), getProgress('7d'), getWorkouts()])
      .then(([d, p, w]) => {
        setDashboard(d);
        setProgress(p);
        setFeatured(Array.isArray(w) ? w.slice(0, 3) : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = dashboard?.stats || dashboard?.summary || dashboard || {};
  const streaks = dashboard?.streak || dashboard?.streaks || stats?.streaks || {};
  const summary = progress?.summary || {};
  const weekly: number[] = progress?.weekly || progress?.daily || dashboard?.weekly || stats?.weekly || [];

  const streakValue =
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
      </section>
    </DashboardShell>
  );
}
