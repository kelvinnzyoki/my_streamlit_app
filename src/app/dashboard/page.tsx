'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Dumbbell, Grid3X3, BarChart3, User,
  CreditCard, Flame, Zap, Clock, Trophy,
} from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import ProgressChart from '@/components/progressChart';
import WorkoutCard from '@/components/workoutCard';
import { getDashboard, getProgress, getWorkouts } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import type { Workout } from '@/types/workout';

const QUICK_NAV = [
  { label: 'Workouts',     href: '/workouts',     Icon: Dumbbell },
  { label: 'Programs',     href: '/programs',     Icon: Grid3X3 },
  { label: 'Progress',     href: '/progress',     Icon: BarChart3 },
  { label: 'Subscription', href: '/subscription', Icon: CreditCard },
  { label: 'Profile',      href: '/profile',      Icon: User },
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
        setFeatured(w.slice(0, 2));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = dashboard?.stats || dashboard || {};
  const weekly: number[] = progress?.weekly || dashboard?.weekly || [];

  const statCards = [
    { label: 'Streak',        value: stats.streak ?? stats.totalStreak ?? 0,          unit: 'days',  Icon: Trophy, color: 'var(--Au-hi)' },
    { label: 'Workouts Done', value: stats.completedWorkouts ?? stats.totalWorkouts ?? 0, unit: 'sessions', Icon: Dumbbell, color: 'var(--sage)' },
    { label: 'Total Minutes', value: stats.totalMinutes ?? stats.minutes ?? 0,          unit: 'min',   Icon: Clock,   color: 'var(--sky)' },
    { label: 'Calories Burned',value: stats.totalCalories ?? stats.calories ?? 0,       unit: 'kcal',  Icon: Flame,   color: 'var(--red)' },
  ];

  return (
    <DashboardShell>
      <section className="page-section">
        <p className="eyebrow">Dashboard</p>
        <h1>Your FlowFit Control Centre</h1>

        {/* ── Stat cards ── */}
        <div className="grid grid-4" style={{ marginBottom: '1.5rem' }}>
          {statCards.map(({ label, value, unit, Icon, color }) => (
            <div key={label} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <p className="stat-label">{label}</p>
                <Icon size={18} style={{ color }} />
              </div>
              <div className="stat-value" style={{ color }}>
                {loading ? '—' : formatNumber(value)}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--t3)', marginTop: '0.25rem' }}>{unit}</p>
            </div>
          ))}
        </div>

        {/* ── Quick nav ── */}
        <div className="quick-nav">
          {QUICK_NAV.map(({ label, href, Icon }) => (
            <Link key={href} href={href} className="quick-nav-card">
              <Icon size={22} />
              <span>{label}</span>
            </Link>
          ))}
        </div>

        {/* ── Weekly chart + featured workout ── */}
        <div className="grid grid-2" style={{ marginTop: '1.5rem' }}>
          <div className="premium-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>Weekly Activity</h2>
              <Link href="/progress" style={{ fontSize: '0.78rem', color: 'var(--Au)' }}>View all →</Link>
            </div>
            <ProgressChart values={weekly} label="Sessions" />
          </div>

          <div className="premium-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>Quick Start</h2>
              <Link href="/workouts" style={{ fontSize: '0.78rem', color: 'var(--Au)' }}>All workouts →</Link>
            </div>
            {featured.length > 0 ? (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {featured.map((w) => (
                  <Link
                    key={w.id}
                    href={`/workouts/session?id=${w.slug || w.id}`}
                    className="mini-link"
                  >
                    <div>
                      <strong style={{ fontSize: '0.9rem' }}>{w.name}</strong>
                      <p className="muted" style={{ margin: 0, fontSize: '0.78rem' }}>{w.category}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--Au)' }}>{w.duration} min</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="muted">Complete your first workout to see recommendations.</p>
            )}
          </div>
        </div>

        {/* ── Active program notice ── */}
        {stats.activeProgram && (
          <div className="premium-card" style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Zap size={20} style={{ color: 'var(--Au)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 600 }}>Active: {stats.activeProgram}</p>
              <p className="muted" style={{ margin: 0, fontSize: '0.82rem' }}>Keep up your current training plan</p>
            </div>
            <Link href="/programs" className="secondary-btn" style={{ flexShrink: 0, fontSize: '0.82rem' }}>
              View Program
            </Link>
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
