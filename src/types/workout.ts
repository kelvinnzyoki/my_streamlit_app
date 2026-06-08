export type WorkoutDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type Workout = {
  id: string;
  slug?: string;
  name: string;
  title?: string;
  description: string;
  image: string;
  category: string;
  level: WorkoutDifficulty;
  difficulty?: WorkoutDifficulty;
  duration: number;
  calories: number;

  muscles?: string[];
  instructions?: string[];
  benefits?: string[];
  equipment?: string;
};
