export type Program = {
  id: string;
  slug?: string;
  title: string;
  description: string;
  level: string;
  focus?: string;
  duration: string;
  image: string;
  workouts: string[];
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
