export type Program = {
  id: string;
  slug?: string;

  title: string;
  name?: string;

  description: string;

  level?: string;
  difficulty?: string;

  focus?: string;
  category?: string;

  duration?: string;
  durationWeeks?: number;
  daysPerWeek?: number;

  image?: string;

  workouts?: string[];

  totalWeeks?: number;
  totalDays?: number;
  totalExercises?: number;

  weeks?: Array<{
    id?: string;
    weekNumber?: number;
    name?: string;
    description?: string;
    days?: Array<{
      id?: string;
      dayNumber?: number;
      name?: string;
      isRestDay?: boolean;
      exercises?: Array<any>;
    }>;
  }>;

  raw?: any;
};
