export type Workout = {
  id: string;
  name: string;
  slug: string;
  category: 'Strength' | 'Cardio' | 'Core' | 'Mobility' | 'Recovery';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number;
  calories: number;
  image: string;
  altImage?: string;
  description: string;
  muscles: string[];
  instructions: string[];
};
