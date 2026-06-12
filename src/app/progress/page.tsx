'use client';

import DashboardShell from '@/components/DashboardShell';
import ProgressChart from '@/components/progressChart';
import { useProgress, type Period } from '@/hooks/useProgress';
import { formatNumber } from '@/lib/utils';
import { Trophy, Flame, Clock, Zap } from 'lucide-react';

const PERIODS: { label: string; value: Period }[] = [
  { label: 'Last 7 Days',  value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
];

export default function ProgressPage() {
  const { progress, loading, period, setPeriod } = useProgress();

  const summary = progress?.summary || {};
  const weekly: number[] = progress?.weekly || progress?.daily || [];
  const calWeekly: number[] = progress?.calories || [];

  const statCards = [
    { label: 'Workouts',   value: summary.workouts   ?? summary.sessions ?? 0,   Icon: Zap,    color: 'var(--Au-hi)' },
    { label: 'Calories',   value: summary.calories   ?? summary.totalCalories ?? 0, Icon: Flame,  color: 'var(--red)' },
    { label: 'Streak',     value: summary.streak     ?? 0,                         Icon: Trophy, color: 'var(--sage)' },
    { label: 'Minutes',    value: summary.minutes    ?? summary.totalMinutes ?? 0,  Icon: Clock,  color: 'var(--sky)' },
  ];

  return (
    <DashboardShell>
      <section className="page-section">
        <p className="eyebrow">Analytics</p>
        <h1>Your Performance Trend</h1>
        <p className="muted" style={{ marginBottom: '1.5rem', maxWidth: 500 }}>
          Track your training consistency, calorie burn, and strength over time.
        </p>

        {/* ── Period tabs ── */}
        <div className="filter-tabs" style={{ marginBottom: '1.75rem' }}>
          {PERIODS.map(({ label, value }) => (
            <button
              key={value}
              className={`tab-btn ${period === value ? 'active' : ''}`}
              onClick={() => setPeriod(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-4" style={{ marginBottom: '1.5rem' }}>
          {statCards.map(({ label, value, Icon, color }) => (
            <div key={label} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <p className="stat-label">{label}</p>
                <Icon size={17} style={{ color }} />
              </div>
              <div className="stat-value" style={{ color }}>
                {loading ? '—' : formatNumber(value)}
              </div>
            </div>
          ))}
        </div>

        {/* ── Charts ── */}
        {loading ? (
          <div className="premium-card" style={{ height: 300, opacity: 0.35 }} />
        ) : (
          <div className="grid grid-2">
            <div className="premium-card">
              <h2 style={{ marginBottom: '1rem' }}>Session Frequency</h2>
              <ProgressChart values={weekly} label="Sessions" />
            </div>
            <div className="premium-card">
              <h2 style={{ marginBottom: '1rem' }}>Calorie Burn</h2>
              <ProgressChart
                values={calWeekly.length ? calWeekly : weekly.map((v) => v * 85)}
                label="Calories"
              />
            </div>
          </div>
        )}

        {/* ── Best workout note ── */}
        {progress?.bestWorkout && (
          <div className="premium-card" style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Trophy size={22} style={{ color: 'var(--Au)', flexShrink: 0 }} />
            <div>
              <p style={{ margin: 0, fontWeight: 600 }}>Best session: {progress.bestWorkout.name}</p>
              <p className="muted" style={{ margin: 0, fontSize: '0.82rem' }}>
                {progress.bestWorkout.duration} min · {progress.bestWorkout.calories} kcal
              </p>
            </div>
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
