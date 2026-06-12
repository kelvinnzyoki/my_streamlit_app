'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  BarChart3,
  Bot,
  CalendarPlus,
  Clock,
  CreditCard,
  Dumbbell,
  Flame,
  Grid3X3,
  Trophy,
  User,
  Zap,
} from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import Footer from '@/components/footer';
import ProgressChart from '@/components/progressChart';
import { getDashboard, getProgress, getWorkouts } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import type { Workout } from '@/types/workout';

const QUICK_NAV = [
  { label: 'AI Coach', href: '/coach', Icon: Bot, desc: 'Ask your personal trainer' },
  { label: 'Generate Plan', href: '/generate-plan', Icon: CalendarPlus, desc: 'Build a custom session' },
  { label: 'Workouts', href: '/workouts', Icon: Dumbbell, desc: 'Start exercising' },
  { label: 'Programs', href: '/programs', Icon: Grid3X3, desc: 'Follow a structure' },
  { label: 'Progress', href: '/progress', Icon: BarChart3, desc: 'Track performance' },
  { label: 'Subscription', href: '/subscription', Icon: CreditCard, desc: 'Manage billing' },
  { label: 'Profile', href: '/profile', Icon: User, desc: 'Update details' },
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
        setFeatured(Array.isArray(w) ? w.slice(0, 2) : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = dashboard?.stats || dashboard || {};
  const weekly: number[] = progress?.weekly || dashboard?.weekly || [];

  const statCards = [
    { label: 'Streak', value: stats.streak ?? stats.totalStreak ?? 0, unit: 'days', Icon: Trophy, tone: 'gold' },
    { label: 'Workouts Done', value: stats.completedWorkouts ?? stats.totalWorkouts ?? 0, unit: 'sessions', Icon: Dumbbell, tone: 'sage' },
    { label: 'Total Minutes', value: stats.totalMinutes ?? stats.minutes ?? 0, unit: 'min', Icon: Clock, tone: 'sky' },
    { label: 'Calories Burned', value: stats.totalCalories ?? stats.calories ?? 0, unit: 'kcal', Icon: Flame, tone: 'red' },
  ];

  return (
    <DashboardShell>
      <section className="page-section dashboard-page">
        <div className="dashboard-hero">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Your FlowFit Control Centre</h1>
            <p className="muted">Train smarter, track your progress, ask the AI coach, and generate structured workout sessions from one place.</p>
          </div>
          <div className="dashboard-hero-actions">
            <Link href="/coach" className="primary-btn"><Bot size={17} /> AI Personal Coach</Link>
            <Link href="/generate-plan" className="secondary-btn"><CalendarPlus size={17} /> Generate Workout Plan</Link>
          </div>
        </div>

        <div className="grid grid-4 dashboard-stat-grid">
          {statCards.map(({ label, value, unit, Icon, tone }) => (
            <div key={label} className={`stat-card dashboard-stat-card stat-tone-${tone}`}>
              <div className="dashboard-stat-head">
                <p className="stat-label">{label}</p>
                <Icon size={19} />
              </div>
              <div className="stat-value">{loading ? '—' : formatNumber(value)}</div>
              <p className="dashboard-stat-unit">{unit}</p>
            </div>
          ))}
        </div>

        <div className="quick-nav quick-nav-dashboard artistic-grid">
          {QUICK_NAV.map(({ label, href, Icon, desc }) => (
            <Link key={href} href={href} className="quick-nav-card artistic-nav-card">
              <Icon size={24} />
              <span>{label}</span>
              <small>{desc}</small>
            </Link>
          ))}
        </div>

        <div className="grid grid-2 dashboard-bottom-grid">
          <div className="premium-card artistic-panel-card">
            <div className="panel-title-row">
              <h2>Weekly Activity</h2>
              <Link href="/progress">View all →</Link>
            </div>
            <ProgressChart values={weekly} label="Sessions" />
          </div>

          <div className="premium-card artistic-panel-card">
            <div className="panel-title-row">
              <h2>Quick Start</h2>
              <Link href="/workouts">All workouts →</Link>
            </div>
            {featured.length > 0 ? (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {featured.map((w) => (
                  <Link key={w.id} href={`/workouts/session?id=${w.slug || w.id}`} className="mini-link workout-art-link">
                    <div>
                      <strong>{w.name}</strong>
                      <p className="muted" style={{ margin: 0, fontSize: '0.78rem' }}>{w.category}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span>{w.duration} min</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="muted">Complete your first workout to see recommendations.</p>
            )}
          </div>
        </div>

        <div className="grid grid-2 dashboard-feature-grid">
          <Link href="/coach" className="premium-card dashboard-feature-card artistic-feature-card">
            <Bot size={25} />
            <div>
              <h2>AI Personal Coach</h2>
              <p className="muted">Open the dedicated AI coach page for fitness advice, form guidance, motivation, and plan feedback.</p>
            </div>
          </Link>
          <Link href="/generate-plan" className="premium-card dashboard-feature-card artistic-feature-card">
            <CalendarPlus size={25} />
            <div>
              <h2>Generate Workout Session</h2>
              <p className="muted">Create a workout session based on your goal, fitness level, time, and available equipment.</p>
            </div>
          </Link>
        </div>

        {stats.activeProgram && (
          <div className="premium-card" style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Zap size={20} style={{ color: 'var(--Au)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 220 }}>
              <p style={{ margin: 0, fontWeight: 600 }}>Active: {stats.activeProgram}</p>
              <p className="muted" style={{ margin: 0, fontSize: '0.82rem' }}>Keep up your current training plan</p>
            </div>
            <Link href="/programs" className="secondary-btn" style={{ flexShrink: 0, fontSize: '0.82rem' }}>View Program</Link>
          </div>
        )}
      </section>
      <Footer />
    </DashboardShell>
  );
}
