import type { Workout } from '@/types/workout';

export const workouts: Workout[] = [
  { id: 'pushups', name: 'Push Ups', image: 'pushups.webp', category: 'Strength', duration: 12, calories: 80, difficulty: 'Beginner' },
  { id: 'squats', name: 'Squats', image: 'squats.webp', category: 'Strength', duration: 15, calories: 95, difficulty: 'Beginner' },
  { id: 'lunges', name: 'Lunges', image: 'lunges (1).webp', category: 'Strength', duration: 14, calories: 90, difficulty: 'Beginner' },
  { id: 'jumping-jacks', name: 'Jumping Jacks', image: 'jumpingjacks.webp', category: 'Cardio', duration: 10, calories: 100, difficulty: 'Beginner' },
  { id: 'burpees', name: 'Burpees', image: 'burpees (1).webp', category: 'HIIT', duration: 12, calories: 140, difficulty: 'Advanced' },
  { id: 'box-jumps', name: 'Box Jumps', image: 'boxjumps.webp', category: 'Power', duration: 12, calories: 120, difficulty: 'Intermediate' },
  { id: 'butt-kicks', name: 'Butt Kicks', image: 'buttkicks (1).webp', category: 'Cardio', duration: 8, calories: 75, difficulty: 'Beginner' },
  { id: 'child-pose', name: 'Child Pose', image: 'childpose (1).webp', category: 'Recovery', duration: 8, calories: 25, difficulty: 'Beginner' },
  { id: 'crunches', name: 'Crunches', image: 'crunches (1).webp', category: 'Core', duration: 10, calories: 70, difficulty: 'Beginner' },
  { id: 'downward-dog', name: 'Downward Dog', image: 'downwarddog.webp', category: 'Mobility', duration: 8, calories: 30, difficulty: 'Beginner' },
  { id: 'glute-bridges', name: 'Glute Bridges', image: 'glutebridges.webp', category: 'Strength', duration: 10, calories: 65, difficulty: 'Beginner' },
  { id: 'high-knees', name: 'High Knees', image: 'highknees.webp', category: 'Cardio', duration: 9, calories: 95, difficulty: 'Intermediate' },
  { id: 'mountain-climbers', name: 'Mountain Climbers', image: 'mountainclimbers (1).webp', category: 'HIIT', duration: 11, calories: 120, difficulty: 'Intermediate' },
  { id: 'plank', name: 'Plank', image: 'plank.webp', category: 'Core', duration: 8, calories: 45, difficulty: 'Beginner' },
  { id: 'russian-twists', name: 'Russian Twists', image: 'russiantwists.webp', category: 'Core', duration: 10, calories: 70, difficulty: 'Intermediate' },
  { id: 'sprints', name: 'Sprint Intervals', image: 'sprints (1).webp', category: 'Cardio', duration: 15, calories: 160, difficulty: 'Advanced' },
  { id: 'tricep-dips', name: 'Tricep Dips', image: 'tricepdips (1).webp', category: 'Strength', duration: 10, calories: 75, difficulty: 'Intermediate' },
];

export function getWorkout(id: string) {
  return workouts.find((workout) => workout.id === id);
}
