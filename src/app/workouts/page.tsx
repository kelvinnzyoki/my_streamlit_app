'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import WorkoutCard from '@/components/workoutCard';
import { useWorkouts } from '@/hooks/useWorkouts';

export default function WorkoutsPage() {
  const { workouts, categories, query, setQuery, category, setCategory, loading, error } = useWorkouts();

  return (
    <DashboardShell>
      <section className="page-section workouts-page">
        <div className="compact-hero workouts-hero premium-card">
          <div>
            <p className="eyebrow">Workout Library</p>
            <h1>Choose Your Session</h1>
            <p className="muted" style={{ maxWidth: 720 }}>
              Browse protected server exercises with search, category filtering, session tracking, and fallback data when the API is offline.
            </p>
          </div>
          <div className="pill-row">
            <span className="pill">{workouts.length} visible</span>
            <span className="pill">Server-first</span>
          </div>
        </div>

        <div className="premium-card controls-card" style={{ margin: '1.25rem 0', padding: '1rem' }}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={17} style={{ position: 'absolute', left: '0.95rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--Au)' }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search exercises, muscles, or categories…"
                style={{ width: '100%', padding: '0.95rem 1rem 0.95rem 2.65rem', background: 'var(--white-05)', border: '1px solid var(--b1)', color: 'var(--t1)', borderRadius: 14 }}
              />
            </div>

            <div className="filter-tabs" style={{ marginBottom: 0 }}>
              <span className="pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><SlidersHorizontal size={14} /> Filters</span>
              {categories.map((cat) => (
                <button key={cat} className={`tab-btn ${category === cat ? 'active' : ''}`} onClick={() => setCategory(cat)}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <div className="alert">{error}</div>}

        {loading ? (
          <div className="grid grid-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="premium-card" style={{ height: 340, opacity: 0.35 }} />)}
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
            {workouts.map((workout) => <WorkoutCard key={workout.id} workout={workout} />)}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
