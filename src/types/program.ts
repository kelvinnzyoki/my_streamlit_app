export type ProgramUsageRecord = {
  id?: string;
  action: string;
  createdAt?: string;
};

export type ProgramEnrollment = {
  id: string;
  programId?: string;
  completedDays?: number;
  currentWeek?: number;
  currentDay?: number;
  progress?: number;
  isActive?: boolean;
  completedAt?: string | null;
  usageRecords?: ProgramUsageRecord[];
  program?: Program;
};

export type ProgramExercise = {
  id?: string;
  exerciseId?: string | null;
  exerciseName?: string;
  name?: string;
  sets?: number;
  reps?: string | number;
  restSeconds?: number;
  notes?: string;
  exercise?: {
    id?: string;
    name?: string;
    description?: string | null;
    category?: string;
    caloriesPerMin?: number;
  } | null;
};

export type ProgramDay = {
  id?: string;
  dayNumber?: number;
  name?: string;
  title?: string;
  isRestDay?: boolean;
  exercises?: ProgramExercise[];
};

export type ProgramWeek = {
  id?: string;
  weekNumber?: number;
  name?: string;
  title?: string;
  description?: string | null;
  days?: ProgramDay[];
};

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
  weeks?: ProgramWeek[];
  totalWeeks?: number;
  totalDays?: number;
  totalExercises?: number;
  warmUp?: string | null;
  coolDown?: string | null;
  progressionTips?: string | null;
  scienceNotes?: string | null;
  estimatedDurationMinutes?: number | null;
  activeEnrollment?: ProgramEnrollment | null;
  raw?: unknown;
};
