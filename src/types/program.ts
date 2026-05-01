// src/types/program.ts
export interface Program {
  id: string;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // weeks
  daysPerWeek: number;
  category: string;
  imageUrl?: string;
  isPremium: boolean;
  workouts: ProgramWorkout[];
  enrolledCount?: number;
  rating?: number;
}

export interface ProgramWorkout {
  week: number;
  day: number;
  name: string;
  exercises: string[];
  duration: number;
}
