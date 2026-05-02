'use client';
// src/app/programs/[id]/page.tsx
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { api } from '@/lib/api';
import type { Program } from '@/types/program';

const MOCK_DETAIL: Program = {
  id: '1',
  name: 'Bodyweight Fundamentals',
  description: 'Master the foundational movement patterns with progressive bodyweight training. This 8-week program builds real functional strength using nothing but your bodyweight. Each week progressively increases in difficulty, ensuring you\'re always challenging your body to adapt and grow stronger.',
  level: 'beginner',
  duration: 8,
  daysPerWeek: 3,
  category: 'Strength',
  isPremium: false,
  enrolledCount: 12400,
  rating: 4.8,
  workouts: [
    { week: 1, day: 1, name: 'Push Foundations', exercises: ['Push-ups', 'Pike Push-ups', 'Tricep Dips'], duration: 35 },
    { week: 1, day: 2, name: 'Pull & Core', exercises: ['Inverted Rows', 'Superman', 'Plank Hold'], duration: 35 },
    { week: 1, day: 3, name: 'Legs & Mobility', exercises: ['Squats', 'Lunges', 'Glute Bridge', 'Hip Flexor Stretch'], duration: 40 },
    { week: 2, day: 1, name: 'Push Progression', exercises: ['Decline Push-ups', 'Diamond Push-ups', 'Wall Handstand'], duration: 38 },
    { week: 2, day: 2, name: 'Pull Advancement', exercises: ['Australian Pull-ups', 'Hollow Body Hold', 'L-sit Attempts'], duration: 38 },
    { week: 2, day: 3, name: 'Lower Power', exercises: ['Jump Squats', 'Bulgarian Split Squats', 'Single-leg Deadlift'], duration: 42 },
  ],
};

export default function ProgramDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    api.get<{ program: Program }>(`/programs/${id}`)
      .then(res => setProgram(res.program))
      .catch(() => setProgram({ ...MOCK_DETAIL, id: String(id) }))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await api.post(`/programs/${id}/enroll`, {});
      router.push('/dashboard');
    } catch {
      router.push('/auth/login');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ink)' }}>
      <div style={{ fontFamily: 'var(--f-mono)', color: 'var(--Au)', fontSize: '.85rem', letterSpacing: '.2em' }}>Loading...</div>
    </div>
  );

  if (!program) return null;

  const levelColors = { beginner: 'var(--sage)', intermediate: 'var(--Au)', advanced: 'var(--red)' };
  const weeks = [...new Set(program.workouts.map(w => w.week))];

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--ink)', padding: '3rem var(--pad-x) 6rem', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 'var(--col-max)', margin: '0 auto' }}>

          <Link href="/programs" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', fontFamily: 'var(--f-display)', fontSize: '.75rem', color: 'var(--t2)', textDecoration: 'none', letterSpacing: '.06em', marginBottom: '2.5rem' }}>← Back to Programs</Link>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem', alignItems: 'start' }}>
            {/* Left */}
            <div>
              <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <span style={{ background: 'var(--Au-12)', color: levelColors[program.level], border: '1px solid var(--b1)', padding: '.25rem .85rem', borderRadius: 3, fontSize: '.62rem', letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: 'var(--f-display)' }}>{program.level}</span>
                {program.isPremium && <span style={{ background: 'var(--Au-15)', color: 'var(--Au-hi)', border: '1px solid var(--Au-28)', padding: '.25rem .85rem', borderRadius: 3, fontSize: '.62rem', letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: 'var(--f-display)' }}>Premium</span>}
              </div>

              <h1 style={{ fontFamily: 'var(--f-serif)', fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(2rem,4vw,3.5rem)', color: 'var(--t1)', lineHeight: 1.1, marginBottom: '1.2rem' }}>{program.name}</h1>
              <p style={{ fontFamily: 'var(--f-display)', fontSize: '.95rem', fontWeight: 300, color: 'var(--t2)', lineHeight: 1.9, marginBottom: '2.5rem' }}>{program.description}</p>

              {/* Program stats */}
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
                {[
                  [`${program.duration}`, 'weeks'],
                  [`${program.daysPerWeek}x`, 'per week'],
                  [`${program.enrolledCount?.toLocaleString()}`, 'enrolled'],
                  [`${program.rating}★`, 'rating'],
                ].map(([val, label]) => (
                  <div key={label}>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: '1.4rem', fontWeight: 300, background: 'var(--g-Au)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '.2rem' }}>{val}</div>
                    <div style={{ fontFamily: 'var(--f-display)', fontSize: '.65rem', color: 'var(--t3)', letterSpacing: '.1em', textTransform: 'uppercase' }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Workout schedule */}
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '.72rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--Au)', marginBottom: '1.5rem' }}>Program Schedule</h2>
              {weeks.slice(0, 2).map(week => (
                <div key={week} style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: '.7rem', color: 'var(--t3)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '.75rem' }}>Week {week}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                    {program.workouts.filter(w => w.week === week).map((workout, i) => (
                      <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '.85rem 1rem', background: 'var(--Au-04)', borderRadius: 'var(--r-sm)', border: '1px solid var(--b3)' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--Au-12)', border: '1px solid var(--b1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-mono)', fontSize: '.7rem', color: 'var(--Au)', flexShrink: 0 }}>D{workout.day}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: 'var(--f-display)', fontSize: '.88rem', color: 'var(--t1)', marginBottom: '.2rem' }}>{workout.name}</div>
                          <div style={{ fontFamily: 'var(--f-display)', fontSize: '.72rem', color: 'var(--t3)' }}>{workout.exercises.join(' · ')}</div>
                        </div>
                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.72rem', color: 'var(--t2)' }}>{workout.duration}m</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {weeks.length > 2 && <p style={{ fontFamily: 'var(--f-display)', fontSize: '.82rem', color: 'var(--t2)', fontStyle: 'italic' }}>+ {weeks.length - 2} more weeks after enrollment</p>}
            </div>

            {/* Right sidebar */}
            <div style={{ position: 'sticky', top: '6rem' }}>
              <div style={{ background: 'var(--g-card)', border: '1px solid var(--Au-25)', borderRadius: 'var(--r-card)', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--g-Au)' }}/>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: '.62rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--Au)', marginBottom: '1rem' }}>
                  {program.isPremium ? 'Premium Program' : 'Free Program'}
                </div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: '2.5rem', fontWeight: 300, background: 'var(--g-Au)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1.5rem' }}>
                  {program.isPremium ? '$12/mo' : 'Free'}
                </div>
                <ul style={{ listStyle: 'none', marginBottom: '2rem' }}>
                  {[
                    `${program.duration}-week structured plan`,
                    `${program.daysPerWeek} sessions per week`,
                    'Progress tracking included',
                    ...(program.isPremium ? ['Video demonstrations', 'Priority support'] : []),
                  ].map(feat => (
                    <li key={feat} style={{ display: 'flex', gap: '.6rem', alignItems: 'flex-start', padding: '.45rem 0', borderBottom: '1px solid var(--b3)', fontFamily: 'var(--f-display)', fontSize: '.82rem', color: 'var(--t2)', lineHeight: 1.6 }}>
                      <span style={{ color: 'var(--sage)', marginTop: '.1rem' }}>✓</span> {feat}
                    </li>
                  ))}
                </ul>
                <button onClick={handleEnroll} disabled={enrolling} style={{ width: '100%', padding: '1rem', background: 'var(--g-Au)', border: 'none', borderRadius: 10, color: 'var(--ink)', fontFamily: 'var(--f-display)', fontSize: '.85rem', fontWeight: 400, letterSpacing: '.1em', textTransform: 'uppercase', cursor: enrolling ? 'not-allowed' : 'pointer', opacity: enrolling ? .7 : 1, boxShadow: '0 8px 24px var(--Au-30)' }}>
                  {enrolling ? 'Enrolling...' : 'Start Program'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
    }
    
