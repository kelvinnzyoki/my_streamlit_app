'use client';
// src/app/programs/page.tsx
import { useEffect, useState } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import ProgramCard from '@/components/programCard';
import { api } from '@/lib/api';
import type { Program } from '@/types/program';

const MOCK_PROGRAMS: Program[] = [
  { id: '1', name: 'Bodyweight Fundamentals', description: 'Master the foundational movement patterns with progressive bodyweight training. Perfect for beginners building a solid fitness base.', level: 'beginner', duration: 8, daysPerWeek: 3, category: 'Strength', isPremium: false, workouts: [], enrolledCount: 12400, rating: 4.8 },
  { id: '2', name: 'Calisthenics Mastery', description: 'Advanced bodyweight skills including handstands, muscle-ups, and planche progressions for experienced athletes.', level: 'advanced', duration: 12, daysPerWeek: 5, category: 'Calisthenics', isPremium: true, workouts: [], enrolledCount: 5600, rating: 4.9 },
  { id: '3', name: 'HIIT Shred Protocol', description: 'High-intensity interval training designed to maximize fat loss while preserving muscle mass. Efficient and brutal.', level: 'intermediate', duration: 6, daysPerWeek: 4, category: 'Cardio', isPremium: false, workouts: [], enrolledCount: 9800, rating: 4.7 },
  { id: '4', name: 'Yoga Flow & Flexibility', description: 'A progressive flexibility and mobility program combining yoga flow with targeted stretching routines.', level: 'beginner', duration: 4, daysPerWeek: 5, category: 'Flexibility', isPremium: false, workouts: [], enrolledCount: 7200, rating: 4.6 },
  { id: '5', name: 'Hybrid Strength Builder', description: 'Combines resistance training fundamentals with athletic movement patterns for well-rounded functional strength.', level: 'intermediate', duration: 10, daysPerWeek: 4, category: 'Strength', isPremium: true, workouts: [], enrolledCount: 4300, rating: 4.8 },
  { id: '6', name: 'Athletic Performance Elite', description: 'Sport-specific training protocols for serious athletes focused on power, speed, and agility development.', level: 'advanced', duration: 16, daysPerWeek: 6, category: 'Athletic', isPremium: true, workouts: [], enrolledCount: 2100, rating: 4.9 },
];

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ programs: Program[] }>('/programs')
      .then(res => setPrograms(res.programs))
      .catch(() => setPrograms(MOCK_PROGRAMS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? programs : programs.filter(p => p.level === filter);

  const filterBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '.45rem 1.1rem',
    background: active ? 'var(--g-Au)' : 'var(--Au-07)',
    border: `1px solid ${active ? 'transparent' : 'var(--b1)'}`,
    borderRadius: 3,
    color: active ? 'var(--ink)' : 'var(--t2)',
    fontFamily: 'var(--f-display)', fontSize: '.62rem', fontWeight: active ? 400 : 300,
    letterSpacing: '.12em', textTransform: 'uppercase',
    cursor: 'pointer', transition: 'all .25s ease',
  });

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--ink)', padding: '3rem var(--pad-x) 6rem', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 'var(--col-max)', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', padding: '.36rem 1.1rem', borderRadius: 3, background: 'var(--Au-07)', border: '1px solid var(--b1)', color: 'var(--Au-hi)', fontFamily: 'var(--f-display)', fontSize: '.64rem', fontWeight: 200, letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: '1.3rem' }}>Programs</span>
            <h1 style={{ fontFamily: 'var(--f-serif)', fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(2.2rem,3.8vw,3.8rem)', color: 'var(--t1)', marginBottom: '.9rem', lineHeight: 1.06 }}>Training Programs</h1>
            <p style={{ fontFamily: 'var(--f-display)', fontSize: '.9rem', fontWeight: 300, color: 'var(--t2)', maxWidth: 500, margin: '0 auto', lineHeight: 2 }}>Structured plans built to take you from where you are to where you want to be</p>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'center', marginBottom: '3rem', flexWrap: 'wrap' }}>
            {(['all', 'beginner', 'intermediate', 'advanced'] as const).map(level => (
              <button key={level} onClick={() => setFilter(level)} style={filterBtnStyle(filter === level)}>
                {level}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'var(--f-mono)', color: 'var(--Au)', fontSize: '.85rem', letterSpacing: '.2em' }}>Loading programs...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
              {filtered.map(program => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

