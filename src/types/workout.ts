// src/types/workout.ts
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
  primaryMuscles?: string[];
  imageUrl?: string;
}

export interface WorkoutSession {
  id: string;
  name: string;
  date: string;
  duration: number; // minutes
  exercises: Exercise[];
  completed: boolean;
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  sessionId: string;
  userId: string;
  completedAt: string;
  durationMinutes: number;
  exercisesCompleted: number;
}
