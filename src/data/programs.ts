import type { Program } from '@/types/program';

export const programs: Program[] = [
  {
    id: 'starter-home-fit',
    slug: 'starter-home-fit',
    title: 'Starter Home Fit',
    description: 'A beginner-friendly full-body program for building consistency at home.',
    level: 'Beginner',
    focus: 'Strength, mobility, and consistency',
    duration: '4 Weeks',
    image: 'fit (1).webp',
    workouts: ['pushups', 'squats', 'lunges', 'plank'],
  },
  {
    id: 'fat-burn-hiit',
    slug: 'fat-burn-hiit',
    title: 'Fat Burn HIIT',
    description: 'High-energy cardio and HIIT sessions for calorie burn and conditioning.',
    level: 'Intermediate',
    focus: 'Fat burn, stamina, and conditioning',
    duration: '6 Weeks',
    image: 'fit1 (1).webp',
    workouts: [
      'jumping-jacks',
      'burpees',
      'high-knees',
      'mountain-climbers',
      'sprints',
    ],
  },
  {
    id: 'core-strength',
    slug: 'core-strength',
    title: 'Core Strength',
    description: 'Focused abs, stability, and core control training.',
    level: 'Intermediate',
    focus: 'Abs, obliques, posture, and stability',
    duration: '4 Weeks',
    image: 'image (1).jpg',
    workouts: ['crunches', 'plank', 'russian-twists', 'leg-raises'],
  },
];

export function getProgram(id: string) {
  return programs.find((program) => program.id === id || program.slug === id);
}
