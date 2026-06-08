export type Program = {
  id: string;
  title: string;
  slug: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  focus: string;
  image: string;
  description: string;
  workouts: string[];
};
