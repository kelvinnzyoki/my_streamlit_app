import Link from 'next/link';
import { Activity, Clock, Flame, Gauge, Play } from 'lucide-react';
import { imageUrl } from '@/lib/utils';
import type { Workout } from '@/types/workout';

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function titleCase(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function workoutLevel(workout: Workout & any) {
  const raw =
    text(workout.level) ||
    text(workout.difficulty) ||
    text(workout.intensity) ||
    text(workout.experienceLevel) ||
    text(workout.raw?.level) ||
    text(workout.raw?.difficulty) ||
    text(workout.metadata?.level) ||
    text(workout.metadata?.difficulty);

  if (!raw) return 'All Levels';

  const normalized = raw.toLowerCase();
  if (normalized.includes('advanced')) return 'Advanced';
  if (normalized.includes('intermediate')) return 'Intermediate';
  if (normalized.includes('beginner')) return 'Beginner';
  return titleCase(raw);
}

export default function WorkoutCard({ workout }: { workout: Workout & any }) {
  const href = `/workouts/session?id=${encodeURIComponent(workout.slug || workout.id)}`;
  const level = workoutLevel(workout);
  const category = workout.category || workout.type || 'Exercise';
  const duration = Number(workout.duration || workout.durationMinutes || workout.estimatedDuration || 10);
  const calories = Number(workout.calories || workout.caloriesBurned || workout.estimatedCalories || 0);

  return (
    <article className="premium-card content-card exercise-card ff-workout-card">
      <Link href={href} className="ff-card-media" aria-label={`Start ${workout.name}`}>
        <img
          src={imageUrl(workout.altImage || workout.image || 'fit.webp')}
          alt={workout.name}
          className="card-img"
          loading="lazy"
        />
        <span className={`ff-level-chip level-${level.toLowerCase().replace(/\s+/g, '-')}`}>
          <Gauge size={13} /> {level}
        </span>
        <span className="ff-card-play"><Play size={16} /></span>
      </Link>

      <div className="card-body ff-card-body">
        <p className="eyebrow ff-card-eyebrow">{category}</p>
        <h3>{workout.name}</h3>
        <p className="muted clamp-3">{workout.description || 'Guided FlowFit home training session.'}</p>

        <div className="ff-card-stat-grid">
          <span><Clock size={14} /> <strong>{duration || 10}</strong><small>min</small></span>
          <span><Flame size={14} /> <strong>{calories || 0}</strong><small>kcal</small></span>
          <span><Activity size={14} /> <strong>{level}</strong><small>level</small></span>
        </div>

        <Link href={href} className="primary-btn card-btn ff-card-btn">
          <Play size={15} /> Start Session
        </Link>
      </div>
    </article>
  );
}
