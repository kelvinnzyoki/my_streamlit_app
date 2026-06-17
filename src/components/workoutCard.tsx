import Link from 'next/link';
import { ArrowRight, Flame, Timer, Dumbbell } from 'lucide-react';
import { imageUrl } from '@/lib/utils';
import type { Workout } from '@/types/workout';

export default function WorkoutCard({ workout }: { workout: Workout }) {
  const href = `/workouts/session?id=${encodeURIComponent(workout.slug || workout.id)}`;
  const duration = Number(workout.duration || 10);
  const calories = Number(workout.calories || 0);
  const category = workout.category || 'Exercise';

  return (
    <article className="ff-workout-card premium-card content-card">
      <Link href={href} className="ff-workout-media" aria-label={`Start ${workout.name}`}>
        <img src={imageUrl(workout.image || workout.altImage || 'fit.webp')} alt={workout.name} loading="lazy" />
        <span className="ff-workout-category">{category}</span>
      </Link>

      <div className="ff-workout-body">
        <div className="ff-workout-title-row">
          <Dumbbell size={18} aria-hidden="true" />
          <h3>{workout.name}</h3>
        </div>

        <p className="muted clamp-3 ff-workout-desc">{workout.description || 'Guided FlowFit workout session.'}</p>

        <div className="ff-workout-stats" aria-label="Workout details">
          <span><Timer size={14} /> {duration} min</span>
          <span><Flame size={14} /> {calories} kcal</span>
        </div>

        <Link href={href} className="primary-btn ff-workout-start">
          Start Session <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}
