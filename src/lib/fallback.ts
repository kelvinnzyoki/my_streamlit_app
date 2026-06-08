import type { Program } from '@/types/program';
import type { Workout } from '@/types/workout';

const ex = (name: string) => `/images/exercises/${name}`;

export const fallbackWorkouts: Workout[] = [
  { id:'1', slug:'pushups', name:'Push Ups', category:'Strength', level:'Beginner', duration:12, calories:80, image:ex('pushups.webp'), description:'Build chest, shoulders, triceps, and core stability.', muscles:['Chest','Shoulders','Triceps','Core'], instructions:['Start in a high plank','Lower with control','Press back up fully'] },
  { id:'2', slug:'squats', name:'Squats', category:'Strength', level:'Beginner', duration:15, calories:95, image:ex('squats.webp'), description:'Lower-body strength for legs, glutes, and athletic control.', muscles:['Quads','Glutes','Hamstrings'], instructions:['Stand tall','Sit hips back','Drive through heels'] },
  { id:'3', slug:'jumping-jacks', name:'Jumping Jacks', category:'Cardio', level:'Beginner', duration:10, calories:95, image:ex('jumpingjacks.webp'), description:'Fast full-body cardio for warming up and calorie burn.', muscles:['Full Body','Calves','Shoulders'], instructions:['Jump feet wide','Raise arms overhead','Return with rhythm'] },
  { id:'4', slug:'lunges', name:'Lunges', category:'Strength', level:'Intermediate', duration:14, calories:105, image:ex('lunges (1).webp'), description:'Single-leg strength builder for knees, hips, and glutes.', muscles:['Glutes','Quads','Core'], instructions:['Step forward','Lower both knees','Push back to stand'] },
  { id:'5', slug:'burpees', name:'Burpees', category:'HIIT', level:'Advanced', duration:12, calories:155, image:ex('burpees (1).webp'), altImage:ex('burpees1 (1).webp'), description:'Explosive full-body conditioning for stamina and fat burn.', muscles:['Full Body','Core','Chest'], instructions:['Drop to plank','Perform push-up if able','Jump up explosively'] },
  { id:'6', slug:'box-jumps', name:'Box Jumps', category:'Power', level:'Intermediate', duration:13, calories:145, image:ex('boxjumps.webp'), altImage:ex('boxjumps1 (1).webp'), description:'Power movement for explosive legs and coordination.', muscles:['Quads','Glutes','Calves'], instructions:['Load hips','Jump softly','Step down safely'] },
  { id:'7', slug:'plank', name:'Plank', category:'Core', level:'Beginner', duration:8, calories:45, image:ex('plank.webp'), description:'Core endurance and total-body tension control.', muscles:['Core','Shoulders','Glutes'], instructions:['Elbows under shoulders','Brace abs','Hold neutral spine'] },
  { id:'8', slug:'mountain-climbers', name:'Mountain Climbers', category:'HIIT', level:'Intermediate', duration:11, calories:120, image:ex('mountainclimbers (1).webp'), description:'High-intensity core and cardio floor movement.', muscles:['Core','Shoulders','Hip Flexors'], instructions:['Hold plank','Drive knees forward','Keep hips low'] },
  { id:'9', slug:'child-pose', name:'Child Pose', category:'Recovery', level:'Beginner', duration:6, calories:20, image:ex('childpose (1).webp'), altImage:ex('childpose1 (1).webp'), description:'Gentle recovery posture for back, hips, and breathing.', muscles:['Back','Hips','Shoulders'], instructions:['Sit hips back','Reach arms forward','Breathe slowly'] },
  { id:'10', slug:'crunches', name:'Crunches', category:'Core', level:'Beginner', duration:10, calories:70, image:ex('crunches (1).webp'), altImage:ex('crunches1 (1).webp'), description:'Classic abdominal movement for core activation.', muscles:['Abs','Core'], instructions:['Support head lightly','Lift shoulders','Lower slowly'] },
];

export const fallbackPrograms: Program[] = [
  { id:'starter-home-fit', slug:'starter-home-fit', title:'Starter Home Fit', description:'A beginner-friendly home program that builds consistency, mobility, and strength.', level:'Beginner', focus:'Consistency and full-body strength', duration:'4 Weeks', image:'fit (1).webp', workouts:['pushups','squats','lunges','plank'] },
  { id:'fat-burn-hiit', slug:'fat-burn-hiit', title:'Fat Burn HIIT', description:'High-intensity sessions for conditioning, calorie burn, and stamina.', level:'Intermediate', focus:'Fat burn and conditioning', duration:'6 Weeks', image:'fit1 (1).webp', workouts:['jumping-jacks','burpees','mountain-climbers','box-jumps'] },
  { id:'core-control', slug:'core-control', title:'Core Control', description:'Abs, posture, stability, and core endurance training.', level:'Beginner', focus:'Core strength and posture', duration:'4 Weeks', image:'image (1).jpg', workouts:['crunches','plank','mountain-climbers','child-pose'] },
];
