'use client';
// src/components/workoutCard.tsx
import Link from 'next/link';
import type { WorkoutSession } from '@/types/workout';
import { formatDuration } from '@/lib/utils';

interface WorkoutCardProps {
  workout: WorkoutSession;
  onStart?: (id: string) => void;
}

export default function WorkoutCard({ workout, onStart }: WorkoutCardProps) {
  return (
    <div style={{
      background: 'var(--g-card)',
      border: '1px solid var(--b1)',
      borderRadius: 'var(--r-card)',
      padding: '1.8rem',
      position: 'relative',
      transition: 'transform .35s var(--ease), border-color .35s ease, box-shadow .35s ease',
      cursor: 'pointer',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)';
      (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--Au)';
      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 60px var(--overlay-60)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.transform = '';
      (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--b1)';
      (e.currentTarget as HTMLDivElement).style.boxShadow = '';
    }}>
      {/* Top gold bar on hover via pseudo is not easily done inline; use a div */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--g-Au)', borderRadius: 'var(--r-card) var(--r-card) 0 0', opacity: workout.completed ? 1 : 0 }}/>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <h3 style={{ fontFamily: 'var(--f-display)', fontSize: '1rem', fontWeight: 300, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--t1)' }}>
          {workout.name}
        </h3>
        {workout.completed && (
          <span style={{ background: 'var(--sage-dim)', color: 'var(--sage)', border: '1px solid var(--sage-25)', padding: '.2rem .65rem', borderRadius: '3px', fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: 'var(--f-display)' }}>
            Done
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {[
          [`${workout.exercises.length}`, 'Exercises'],
          [formatDuration(workout.duration), 'Duration'],
        ].map(([val, label]) => (
          <div key={label}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: '1.1rem', fontWeight: 300, background: 'var(--g-Au)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{val}</div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: '.65rem', color: 'var(--t2)', letterSpacing: '.08em', textTransform: 'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onStart?.(workout.id)}
        style={{
          width: '100%', padding: '.7rem', background: 'var(--Au-10)',
          border: '1px solid var(--b1)', borderRadius: 'var(--r-sm)',
          color: 'var(--Au-hi)', fontFamily: 'var(--f-display)',
          fontSize: '.75rem', letterSpacing: '.1em', textTransform: 'uppercase',
          cursor: 'pointer', transition: 'all .3s ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--Au-20)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--Au)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--Au-10)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--b1)'; }}
      >
        {workout.completed ? 'Log Again' : 'Start Workout'}
      </button>
    </div>
  );
        }
