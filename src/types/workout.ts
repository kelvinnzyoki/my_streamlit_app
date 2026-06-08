export type WorkoutDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type Workout = {
  id: string;
  name: string;
  image: string;
  category: string;
  duration: number;
  calories: number;
  difficulty: WorkoutDifficulty;
};
