import Link from 'next/link';
import { imageUrl } from '@/lib/utils';
import type { Workout } from '@/types/workout';

export default function WorkoutCard({ workout }: { workout: Workout }) {
  const href = `/workouts/session?id=${workout.slug || workout.id}`;
  return (
    <article className="premium-card content-card">
      <img
        src={imageUrl(workout.image)}
        alt={workout.name}
        className="card-img"
        loading="lazy"
      />
      <div className="card-body">
        <p className="eyebrow">{workout.category}</p>
        <h3>{workout.name}</h3>
        <p className="muted clamp-3">{workout.description}</p>
        <div className="metric-row">
          <span>{workout.duration} min</span>
          <span>{workout.calories} kcal</span>
          <span className="pill">{workout.level || workout.difficulty}</span>
        </div>
        <Link href={href} className="primary-btn card-btn">
          Start Session
        </Link>
      </div>
    </article>
  );
}
