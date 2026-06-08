export type WorkoutLevel = 'Beginner' | 'Intermediate' | 'Advanced' | string;

export type Workout = {
  id: string;
  slug?: string;
  name: string;
  title?: string;
  description: string;
  image: string;
  altImage?: string;
  category: string;
  level: WorkoutLevel;
  difficulty?: WorkoutLevel;
  duration: number;
  calories: number;
  muscles?: string[];
  instructions?: string[];
  benefits?: string[];
  equipment?: string;
};
