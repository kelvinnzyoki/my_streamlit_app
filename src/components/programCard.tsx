'use client';
// src/components/programCard.tsx
import Link from 'next/link';
import type { Program } from '@/types/program';

interface ProgramCardProps {
  program: Program;
}

const levelColors = {
  beginner: { bg: 'var(--sage-dim)', color: 'var(--sage)', border: 'var(--sage-25)' },
  intermediate: { bg: 'var(--Au-12)', color: 'var(--Au)', border: 'var(--b1)' },
  advanced: { bg: 'var(--red-10)', color: 'var(--red)', border: 'var(--red-20)' },
};

export default function ProgramCard({ program }: ProgramCardProps) {
  const colors = levelColors[program.level];
  return (
    <div style={{
      background: 'var(--g-card)', border: '1px solid var(--b1)',
      borderRadius: 'var(--r-card)', padding: '2rem', position: 'relative',
      overflow: 'hidden', transition: 'transform .35s var(--ease), border-color .35s ease, box-shadow .35s ease',
    }}
    onMouseEnter={e => {
      const el = e.currentTarget as HTMLDivElement;
      el.style.transform = 'translateY(-8px)'; el.style.borderColor = 'var(--Au)';
      el.style.boxShadow = '0 28px 70px var(--overlay-50)';
    }}
    onMouseLeave={e => {
      const el = e.currentTarget as HTMLDivElement;
      el.style.transform = ''; el.style.borderColor = 'var(--b1)'; el.style.boxShadow = '';
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--g-Au)' }}/>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <span style={{ background: colors.bg, color: colors.color, border: `1px solid ${colors.border}`, padding: '.25rem .75rem', borderRadius: '3px', fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: 'var(--f-display)' }}>
          {program.level}
        </span>
        {program.isPremium && (
          <span style={{ background: 'var(--Au-12)', color: 'var(--Au-hi)', border: '1px solid var(--b1)', padding: '.25rem .75rem', borderRadius: '3px', fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: 'var(--f-display)' }}>
            Premium
          </span>
        )}
      </div>

      <h3 style={{ fontFamily: 'var(--f-serif)', fontWeight: 300, fontStyle: 'italic', fontSize: '1.4rem', color: 'var(--t1)', marginBottom: '.75rem' }}>
        {program.name}
      </h3>
      <p style={{ fontFamily: 'var(--f-display)', color: 'var(--t2)', fontSize: '.85rem', fontWeight: 300, lineHeight: 1.8, marginBottom: '1.5rem' }}>
        {program.description}
      </p>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {[[`${program.duration}w`, 'Duration'],[`${program.daysPerWeek}x/wk`, 'Frequency']].map(([val, label]) => (
          <div key={label}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: '1rem', fontWeight: 300, background: 'var(--g-Au)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{val}</div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: '.65rem', color: 'var(--t2)', letterSpacing: '.08em', textTransform: 'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>

      <Link href={`/programs/${program.id}`} style={{
        display: 'block', width: '100%', padding: '.75rem', textAlign: 'center',
        background: 'var(--Au-10)', border: '1px solid var(--b1)',
        borderRadius: 'var(--r-sm)', color: 'var(--Au-hi)',
        fontFamily: 'var(--f-display)', fontSize: '.75rem', letterSpacing: '.1em',
        textTransform: 'uppercase', textDecoration: 'none', transition: 'all .3s ease',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--Au-20)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--Au)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--Au-10)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--b1)'; }}>
        View Program
      </Link>
    </div>
  );
}
