'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BarChart3, Bot, Clock, CreditCard, Dumbbell, Flame, Grid3X3, Sparkles, Trophy } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import ProgressChart from '@/components/progressChart';
import { getDashboard, getProgress, getWorkouts } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import type { Workout } from '@/types/workout';

const QUICK_NAV = [
  { label: 'Workouts', href: '/workouts', Icon: Dumbbell, copy: 'Start a protected server session' },
  { label: 'Programs', href: '/programs', Icon: Grid3X3, copy: 'View your server plans' },
  { label: 'Progress', href: '/progress', Icon: BarChart3, copy: 'Track real workout logs' },
  { label: 'AI Coach', href: '/coach', Icon: Bot, copy: 'Ask your personal coach' },
  { label: 'Generate Plan', href: '/generate-plan', Icon: Sparkles, copy: 'Create a new server plan' },
  { label: 'Subscription', href: '/subscription', Icon: CreditCard, copy: 'Manage your active plan' },
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
  const weekly: number[] = progress?.weekly || progress?.daily || dashboard?.weekly || [];

  const statCards = [
    { label: 'Streak', value: stats.streak ?? stats.totalStreak ?? 0, unit: 'days', Icon: Trophy },
    { label: 'Workouts Done', value: stats.completedWorkouts ?? stats.totalWorkouts ?? stats.workouts ?? 0, unit: 'sessions', Icon: Dumbbell },
    { label: 'Total Minutes', value: stats.totalMinutes ?? stats.minutes ?? 0, unit: 'min', Icon: Clock },
    { label: 'Calories Burned', value: stats.totalCalories ?? stats.calories ?? stats.caloriesBurned ?? 0, unit: 'kcal', Icon: Flame },
  ];

  return (
    <DashboardShell>
      <section className="page-section dashboard-elite">
        <div className="dashboard-hero-strip">
          <p className="eyebrow">Dashboard</p>
          <h1>Your FlowFit Control Centre</h1>
          <p className="muted">Live server-powered workout data, progress analytics, AI coaching, and program management in one protected workspace.</p>
        </div>

        <div className="grid grid-4 elite-stat-grid">
          {statCards.map(({ label, value, unit, Icon }) => (
            <div key={label} className="stat-card elite-stat-card">
              <Icon size={18} />
              <div className="stat-value">{loading ? '—' : formatNumber(value)}</div>
              <p className="stat-label">{label}</p>
              <small>{unit}</small>
            </div>
          ))}
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
              <h2>Weekly Activity</h2>
              <Link href="/progress">View all →</Link>
            </div>
            <ProgressChart values={weekly} label="Sessions" />
          </div>

          <div className="premium-card artistic-panel">
            <div className="panel-headline">
              <h2>Server Quick Start</h2>
              <Link href="/workouts">All workouts →</Link>
            </div>
            {featured.length > 0 ? (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {featured.map((w) => (
                  <Link key={w.id} href={`/workouts/session?id=${w.slug || w.id}`} className="mini-link">
                    <div>
                      <strong>{w.name}</strong>
                      <p className="muted" style={{ margin: 0, fontSize: '0.78rem' }}>{w.category || w.level || 'Workout'}</p>
                    </div>
                    <span style={{ color: 'var(--Au)' }}>{w.duration || 10} min</span>
                  </Link>
                ))}
              </div>
            ) : <p className="muted">Server workout recommendations will appear here after your first logs.</p>}
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
