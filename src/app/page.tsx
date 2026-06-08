import Image from 'next/image';
import Link from 'next/link';
import { Brain, ChartSpline, Dumbbell, Salad, ShieldCheck, Zap, type LucideIcon } from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import ProgramCard from '@/components/programCard';
import WorkoutCard from '@/components/workoutCard';
import { programs } from '@/data/programs';
import { workouts } from '@/data/workouts';

const features: Array<[LucideIcon, string, string]> = [
  [Brain, 'AI Personal Coach', 'Generate smart workout guidance from your goals, recovery, level, and training history.'],
  [ChartSpline, 'Advanced Analytics', 'Track calories, streaks, readiness, consistency, and workout trend movement.'],
  [Dumbbell, 'No Equipment Needed', 'Premium home routines built around bodyweight movements and practical spaces.'],
  [Salad, 'Planned Diet Support', 'Nutrition guidance that supports weight loss, muscle tone, energy, and recovery.'],
  [Zap, 'Progressive Programs', 'Beginner to advanced plans that scale intensity as your fitness improves.'],
  [ShieldCheck, 'Private by Design', 'Frontend uses secure cookie-based auth and avoids exposing sensitive backend secrets.']
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <p className="eyebrow">FlowFit Home Workouts</p>
              <h1 className="display">Transform your body at home.</h1>
              <p className="lead">A premium AI-powered fitness platform with no-equipment workouts, progress tracking, analytics, personalized programs, notifications, and a refined dark/light FlowFit interface.</p>
              <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', marginTop:'2rem' }}>
                <Link className="primary-btn" href="/auth/register">Start Free</Link>
                <Link className="secondary-btn" href="/workouts">Explore Workouts</Link>
              </div>
            </div>
            <div className="hero-visual">
              <Image src="/images/fit%20(1).webp" alt="FlowFit athlete training at home" fill priority sizes="(max-width: 900px) 100vw, 48vw" />
              <div className="hero-stat"><div><strong>21+</strong><span>Exercises</span></div><div><strong>AI</strong><span>Coach</span></div><div><strong>0</strong><span>Equipment</span></div></div>
            </div>
          </div>
        </section>
        <section className="section"><div className="container"><p className="eyebrow">Platform Features</p><h2 className="title">Everything from the original FlowFit, rebuilt as components.</h2><div className="grid grid-3">{features.map(([Icon, title, text]) => <article className="card" key={title}><div className="feature-icon"><Icon size={22}/></div><h3>{title}</h3><p className="muted">{text}</p></article>)}</div></div></section>
        <section className="section"><div className="container page-head"><div><p className="eyebrow">Workouts</p><h2 className="title">Image-driven exercise library.</h2></div><Link className="secondary-btn" href="/workouts">View all</Link></div><div className="container grid grid-3">{workouts.slice(0,6).map((workout) => <WorkoutCard key={workout.id} workout={workout}/>)}</div></section>
        <section className="section"><div className="container page-head"><div><p className="eyebrow">Programs</p><h2 className="title">Structured plans that feel premium.</h2></div><Link className="secondary-btn" href="/programs">All programs</Link></div><div className="container grid grid-4">{programs.map((program) => <ProgramCard key={program.id} program={program}/>)}</div></section>
      </main>
      <Footer />
    </>
  );
}
