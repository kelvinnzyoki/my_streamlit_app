import Link from 'next/link';
import { Flame, Gauge, PlayCircle, Timer, Zap } from 'lucide-react';
import { imageUrl } from '@/lib/utils';
import type { Workout } from '@/types/workout';

const WORKOUT_IMAGE_BY_CATEGORY: Record<string, string> = {
  strength: '/images/exercises/pushups.webp',
  cardio: '/images/exercises/highknees.webp',
  hiit: '/images/exercises/burpees.webp',
  core: '/images/exercises/plank.webp',
  mobility: '/images/exercises/downwarddog.webp',
  conditioning: '/images/exercises/sprints.webp',
  flexibility: '/images/exercises/childpose.webp',
};

function workoutImage(workout: any) {
  if (workout.image || workout.imageUrl || workout.coverImage) {
    return imageUrl(workout.image || workout.imageUrl || workout.coverImage);
  }

  const category = String(workout.category || 'strength').toLowerCase();
  return WORKOUT_IMAGE_BY_CATEGORY[category] || '/images/fit.webp';
}

function cleanLabel(value: unknown, fallback = 'Exercise') {
  return String(value || fallback).replace(/[_-]+/g, ' ');
}

export default function WorkoutCard({ workout }: { workout: Workout & any }) {
  const href = `/workouts/session?id=${encodeURIComponent(workout.slug || workout.id)}`;

  const title = workout.name || workout.title || 'FlowFit Workout';
  const category = cleanLabel(workout.category || workout.focus || 'Exercise');
  const level = cleanLabel(workout.level || workout.difficulty || 'Beginner');
  const duration = Number(workout.duration || workout.durationMinutes || 10);
  const calories = Number(workout.calories || workout.caloriesBurned || 0);

  return (
    <article className="premium-card content-card ff-workout-card">
      <div className="ff-card-media">
        <img
          src={workoutImage(workout)}
          alt={title}
          className="ff-card-img"
          loading="lazy"
        />

        <div className="ff-card-shade" />

        <div className="ff-card-topline">
          <span className="ff-card-badge">
            <Zap size={13} />
            {category}
          </span>

          <span className="ff-card-badge muted-badge">
            <Gauge size={13} />
            {level}
          </span>
        </div>

        <div className="ff-card-media-title">
          <p>Quick session</p>
          <h3>{title}</h3>
        </div>
      </div>

      <div className="ff-card-body">
        <p className="ff-card-desc">{workout.description || 'A guided FlowFit workout session designed for efficient home training.'}</p>

        <div className="ff-meta-grid workout-meta-grid">
          <span>
            <Timer size={15} />
            <strong>{Number.isFinite(duration) ? duration : 10}</strong>
            <small>min</small>
          </span>

          <span>
            <Flame size={15} />
            <strong>{Number.isFinite(calories) ? calories : 0}</strong>
            <small>kcal</small>
          </span>

          <span>
            <Gauge size={15} />
            <strong>{level}</strong>
            <small>level</small>
          </span>
        </div>

        <Link href={href} className="primary-btn ff-card-btn">
          <PlayCircle size={16} />
          Start Session
        </Link>
      </div>
    </article>
  );
}
