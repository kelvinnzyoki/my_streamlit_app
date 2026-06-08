import Link from 'next/link';
import type { Workout } from '@/types/workout';
import { imageUrl } from '@/lib/utils';

export default function WorkoutCard({ workout }: { workout: Workout }) {
  const id = workout.slug || workout.id;
  return (
    <article className="premium-card">
      <img className="card-img" src={imageUrl(workout.image)} alt={workout.name}/>
      <p className="eyebrow">{workout.category}</p>
      <h3>{workout.name}</h3>
      <p className="muted">{workout.description}</p>
      <div className="pill-row"><span className="pill">{workout.level || workout.difficulty}</span><span className="pill">{workout.duration} min</span><span className="pill">{workout.calories} kcal</span></div>
      <Link className="primary-btn" href={`/workouts/session?id=${id}`}>Start Workout</Link>
    </article>
  );
}
