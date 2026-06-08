export function cn(...classes: Array<string | false | null | undefined>) { return classes.filter(Boolean).join(' '); }
export function formatDuration(minutes: number) { return `${minutes} min`; }
export const workouts = [
 {id:'jumping-jacks',title:'Jumping Jacks',category:'Cardio',level:'Beginner',duration:12,calories:90,image:'/images/exercises/jumpingjacks.webp',description:'Full-body cardio starter for warmups and fat burning.'},
 {id:'lunges',title:'Lunges',category:'Strength',level:'Intermediate',duration:18,calories:120,image:'/images/exercises/lunges.webp',description:'Lower-body strength and balance training.'},
 {id:'child-pose',title:'Child Pose',category:'Recovery',level:'Beginner',duration:8,calories:25,image:'/images/exercises/childpose.webp',description:'Recovery stretch for hips, spine, and breath control.'},
 {id:'squats',title:'Bodyweight Squats',category:'Strength',level:'Beginner',duration:15,calories:110,description:'No-equipment lower body power builder.'},
];
export const programs = [
 {id:'starter',title:'Home Starter Reset',level:'Beginner',weeks:4,focus:'Consistency',description:'Build your routine with simple no-equipment workouts.',featured:true},
 {id:'fat-burn',title:'Fat Burn Engine',level:'Intermediate',weeks:6,focus:'Cardio + Core',description:'High-energy sessions, recovery checks, and progress goals.',featured:true},
 {id:'strength',title:'Lean Strength Builder',level:'Intermediate',weeks:8,focus:'Strength',description:'Progressive bodyweight training for stronger muscles.'},
 {id:'mobility',title:'Mobility & Recovery',level:'All Levels',weeks:3,focus:'Flexibility',description:'Stretching, breathing, and joint-friendly movement.'},
];
