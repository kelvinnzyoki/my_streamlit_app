import Image from 'next/image';
import Link from 'next/link';
import type { Workout } from '@/types/workout';
import { imageUrl } from '@/lib/utils';

export default function WorkoutCard({ workout }: { workout: Workout }) {
  return (
    <article className="premium-card workout-card">
      <div className="workout-img"><Image src={imageUrl(workout.image)} alt={workout.name} fill sizes="(max-width: 900px) 100vw, 33vw" /></div>
      <div className="workout-body">
        <p className="eyebrow">{workout.category}</p>
        <h3>{workout.name}</h3>
        <p className="muted">{workout.description}</p>
        <div className="pill-row"><span className="pill">{workout.level}</span><span className="pill">{workout.duration} min</span><span className="pill">{workout.calories} kcal</span></div>
        <Link className="primary-btn" href={`/workouts/session?id=${workout.slug}`}>Start Workout</Link>
      </div>
    </article>
  );
}
