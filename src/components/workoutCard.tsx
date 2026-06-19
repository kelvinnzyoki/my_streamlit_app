import Link from 'next/link';
import { ArrowRight, Flame, Timer, Dumbbell } from 'lucide-react';
import type { Workout } from '@/types/workout';

const WORKOUT_IMAGE_MAP: Record<string, string> = {
  boxjumps: 'boxjumps.webp',
  burpees: 'burpees.webp',
  buttkicks: 'buttkicks.webp',
  childpose: 'childpose.webp',
  crunches: 'crunches.webp',
  downwarddog: 'downwarddog.webp',
  glutebridges: 'glutebridges.webp',
  highknees: 'highknees.webp',
  hipflexor: 'hipflexor.webp',
  jumpingjacks: 'jumpingjacks.webp',
  jumpsquats: 'jumpsquats.webp',
  legraises: 'legraises.webp',
  lunges: 'lunges.webp',
  mountainclimbers: 'mountainclimbers.webp',
  pikepushups: 'pikepushups.webp',
  plank: 'plank.webp',
  pushups: 'pushups.webp',
  russiantwists: 'russiantwists.webp',
  sprints: 'sprints.webp',
  squats: 'squats.webp',
  tricepdips: 'tricepdips.webp',
};

function clean(value?: string | null) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '');
}

function canonicalWorkoutKey(workout: Workout) {
  const candidates = [workout.slug, workout.id, workout.name].map(clean).filter(Boolean);
  const joined = candidates.join(' ');

  if (joined.includes('boxjump')) return 'boxjumps';
  if (joined.includes('burpee')) return 'burpees';
  if (joined.includes('buttkick')) return 'buttkicks';
  if (joined.includes('childpose')) return 'childpose';
  if (joined.includes('crunch')) return 'crunches';
  if (joined.includes('downwarddog')) return 'downwarddog';
  if (joined.includes('glutebridge')) return 'glutebridges';
  if (joined.includes('highknee')) return 'highknees';
  if (joined.includes('hipflexor')) return 'hipflexor';
  if (joined.includes('jumpingjack')) return 'jumpingjacks';
  if (joined.includes('jumpsquat')) return 'jumpsquats';
  if (joined.includes('legraise')) return 'legraises';
  if (joined.includes('lunge')) return 'lunges';
  if (joined.includes('mountainclimber')) return 'mountainclimbers';
  if (joined.includes('pikepush')) return 'pikepushups';
  if (joined.includes('plank')) return 'plank';
  if (joined.includes('pushup') || joined.includes('push')) return 'pushups';
  if (joined.includes('russiantwist')) return 'russiantwists';
  if (joined.includes('sprint')) return 'sprints';
  if (joined.includes('squat')) return 'squats';
  if (joined.includes('tricepdip') || joined.includes('dip')) return 'tricepdips';

  return '';
}

function workoutImageSrc(workout: Workout) {
  const key = canonicalWorkoutKey(workout);
  if (key && WORKOUT_IMAGE_MAP[key]) return `/images/exercises/${WORKOUT_IMAGE_MAP[key]}`;

  const raw = String(workout.image || workout.altImage || '').trim();
  if (!raw) return '/images/fit.webp';
  if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) return raw;
  if (raw.includes('/')) return `/${raw.replace(/^\/+/, '')}`;
  return `/images/exercises/${raw}`;
}

export default function WorkoutCard({ workout }: { workout: Workout }) {
  const href = `/workouts/session?id=${encodeURIComponent(workout.slug || workout.id)}`;
  const duration = Number(workout.duration || 10);
  const calories = Number(workout.calories || 0);
  const category = workout.category || 'Exercise';

  return (
    <article className="ff-workout-card premium-card content-card">
      <Link href={href} className="ff-workout-media" aria-label={`Start ${workout.name}`}>
        <img src={workoutImageSrc(workout)} alt={workout.name} loading="lazy" />
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
