import type { Program } from '@/types/program';

export const programs: Program[] = [
  { id:'p1', slug:'starter-reset', title:'Starter Reset', duration:'14 days', level:'Beginner', focus:'Consistency, mobility, light strength', image:'/images/fit (1).webp', description:'A gentle but structured program to restart your fitness rhythm at home.', workouts:['jumping-jacks','squats','pushups','child-pose'] },
  { id:'p2', slug:'lean-burn', title:'Lean Burn', duration:'21 days', level:'Intermediate', focus:'Fat loss and cardio conditioning', image:'/images/image (1).jpg', description:'High-energy bodyweight circuits built for calorie burn without equipment.', workouts:['burpees','mountain-climbers','high-knees','sprint-intervals'] },
  { id:'p3', slug:'core-control', title:'Core Control', duration:'18 days', level:'Intermediate', focus:'Abs, posture, trunk strength', image:'/images/fit1 (1).webp', description:'Core-focused sessions combining stability, rotation, and lower-ab strength.', workouts:['plank','crunches','leg-raises','russian-twists'] },
  { id:'p4', slug:'power-athlete', title:'Power Athlete', duration:'28 days', level:'Advanced', focus:'Explosive power and full-body performance', image:'/images/Untitled (1).webp', description:'Advanced explosive home sessions for stronger legs, shoulders, and conditioning.', workouts:['box-jumps','jump-squats','pike-pushups','burpees'] }
];

export function getProgram(slug: string) {
  return programs.find((p) => p.slug === slug) || programs[0];
}
