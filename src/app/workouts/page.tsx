'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import WorkoutCard from '@/components/workoutCard';
import { useWorkouts } from '@/hooks/useWorkouts';
import Footer from '@/components/footer';

export default function WorkoutsPage() {
  const { workouts, categories, query, setQuery, category, setCategory, loading } = useWorkouts();

  return (
    <DashboardShell>
      <section className="page-section workouts-page">
        <div className="workouts-hero premium-card">
          <p className="eyebrow">Workout Library</p>
          <h1>Choose Your Session</h1>
          <p className="muted">
            Browse strength, cardio, core, mobility, and conditioning workouts. Pick a session, start the timer, and log your performance.
          </p>
        </div>

        <div className="workouts-toolbar premium-card">
          <div className="workouts-searchbox">
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search exercises…"
              aria-label="Search exercises"
            />
          </div>

          <div className="workouts-count-pill">
            <SlidersHorizontal size={15} />
            {loading ? 'Loading…' : `${workouts.length} workout${workouts.length === 1 ? '' : 's'}`}
          </div>
        </div>

        <div className="filter-tabs workouts-filter-tabs">
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

        {loading ? (
          <div className="grid grid-3 workouts-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="premium-card workout-skeleton" />
            ))}
          </div>
        ) : workouts.length === 0 ? (
          <div className="premium-card workouts-empty">
            <p className="muted">No workouts match your search. Try a different filter.</p>
            <button className="secondary-btn" onClick={() => { setQuery(''); setCategory('All'); }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-3 workouts-grid">
            {workouts.map((workout) => <WorkoutCard key={workout.id} workout={workout} />)}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
