import Link from 'next/link';
import { Flame, Timer } from 'lucide-react';
import { imageUrl } from '@/lib/utils';
import type { Workout } from '@/types/workout';

export default function WorkoutCard({ workout }: { workout: Workout }) {
  const href = `/workouts/session?id=${encodeURIComponent(workout.slug || workout.id)}`;

  return (
    <article className="premium-card content-card exercise-card ff-workout-card-premium">
      <div className="ff-card-image-wrap">
        <img src={imageUrl(workout.image)} alt={workout.name} className="card-img" loading="lazy" />
        <span className="ff-card-category">{workout.category || 'Exercise'}</span>
      </div>

      <div className="card-body ff-card-body-premium">
        <h3>{workout.name}</h3>
        <p className="muted clamp-3">{workout.description}</p>

        <div className="ff-card-metrics">
          <span><Timer size={14} /> {workout.duration || 10} min</span>
          <span><Flame size={14} /> {workout.calories || 0} kcal</span>
        </div>

        <Link href={href} className="primary-btn card-btn">Start Session</Link>
      </div>
    </article>
  );
}
