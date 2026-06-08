import Link from 'next/link';
import type { Workout } from '@/types/workout';
import { imageUrl } from '@/lib/utils';

export default function WorkoutCard({ workout }: { workout: Workout }) {
  const id = workout.slug || workout.id;

  return (
    <article className="premium-card content-card workout-card">
      <img className="card-img" src={imageUrl(workout.image)} alt={workout.name} loading="lazy" />
      <div className="card-body">
        <p className="eyebrow">{workout.category}</p>
        <h3>{workout.name}</h3>
        <p className="muted clamp-3">{workout.description}</p>
        <div className="pill-row">
          <span className="pill">{workout.level || workout.difficulty || 'Beginner'}</span>
          <span className="pill">{workout.duration} min</span>
          <span className="pill">{workout.calories} kcal</span>
        </div>
        <Link className="primary-btn card-btn" href={`/workouts/session?id=${id}`}>
          Start Workout
        </Link>
      </div>
    </article>
  );
}
