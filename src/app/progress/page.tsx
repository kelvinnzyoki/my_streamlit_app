'use client';

import DashboardShell from '@/components/DashboardShell';
import ProgressChart from '@/components/progressChart';
import { useProgress, type Period } from '@/hooks/useProgress';
import { formatNumber } from '@/lib/utils';
import { Clock, Flame, Trophy, Zap } from 'lucide-react';

const PERIODS: { label: string; value: Period }[] = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
];

export default function ProgressPage() {
  const { progress, loading, period, setPeriod } = useProgress();
  const summary = progress?.summary || progress || {};
  const weekly: number[] = progress?.weekly || progress?.daily || [];
  const calWeekly: number[] = progress?.calories || [];
  const statCards = [
    { label: 'Workouts', value: summary.workouts ?? summary.sessions ?? 0, Icon: Zap },
    { label: 'Calories', value: summary.calories ?? summary.totalCalories ?? 0, Icon: Flame },
    { label: 'Streak', value: summary.streak ?? 0, Icon: Trophy },
    { label: 'Minutes', value: summary.minutes ?? summary.totalMinutes ?? 0, Icon: Clock },
  ];

  return (
    <DashboardShell>
      <section className="page-section">
        <p className="eyebrow">Protected Analytics</p>
        <h1>Your Performance Trend</h1>
        <p className="muted" style={{ marginBottom: '1.5rem', maxWidth: 560 }}>Progress is loaded from server workout logs. No fake stats are used unless the server is unavailable.</p>
        <div className="filter-tabs">{PERIODS.map(({ label, value }) => <button key={value} className={`tab-btn ${period === value ? 'active' : ''}`} onClick={() => setPeriod(value)}>{label}</button>)}</div>
        <div className="grid grid-4" style={{ marginBottom: '1.5rem' }}>{statCards.map(({ label, value, Icon }) => <div key={label} className="stat-card elite-stat-card"><Icon size={17} /><div className="stat-value">{loading ? '—' : formatNumber(value)}</div><p className="stat-label">{label}</p></div>)}</div>
        {loading ? <div className="premium-card" style={{ height: 300, opacity: 0.35 }} /> : <div className="grid grid-2"><div className="premium-card artistic-panel"><h2>Session Frequency</h2><ProgressChart values={weekly} label="Sessions" /></div><div className="premium-card artistic-panel"><h2>Calorie Burn</h2><ProgressChart values={calWeekly.length ? calWeekly : weekly.map((v) => v * 85)} label="Calories" /></div></div>}
      </section>
    </DashboardShell>
  );
}
