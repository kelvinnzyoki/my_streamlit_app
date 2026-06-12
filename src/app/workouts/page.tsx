'use client';

import { Search } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import WorkoutCard from '@/components/workoutCard';
import { useWorkouts } from '@/hooks/useWorkouts';

export default function WorkoutsPage() {
  const { workouts, categories, query, setQuery, category, setCategory, loading } = useWorkouts();

  return (
    <DashboardShell>
      <section className="page-section">
        <p className="eyebrow">Workout Library</p>
        <h1>Choose Your Session</h1>
        <p className="muted" style={{ marginBottom: '1.5rem', maxWidth: 560 }}>
          {workouts.length} exercise{workouts.length !== 1 ? 's' : ''} across strength, cardio, core, and more.
        </p>

        {/* ── Search ── */}
        <div className="premium-card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', pointerEvents: 'none' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search exercises…"
              style={{
                width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem',
                background: 'var(--white-05)', border: '1px solid var(--b1)',
                color: 'var(--t1)', borderRadius: '12px',
              }}
            />
          </div>
        </div>

        {/* ── Filter tabs ── */}
        <div className="filter-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`tab-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="grid grid-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="premium-card" style={{ height: 340, opacity: 0.4 }} />
            ))}
          </div>
        ) : workouts.length === 0 ? (
          <div className="premium-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p className="muted">No workouts match your search. Try a different filter.</p>
            <button className="secondary-btn" style={{ marginTop: '1rem' }} onClick={() => { setQuery(''); setCategory('All'); }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-3">
            {workouts.map((w) => <WorkoutCard key={w.id} workout={w} />)}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
