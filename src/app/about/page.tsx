// src/app/about/page.tsx
import type { Metadata } from 'next';
import LegalLayout from '../legal/LegalLayout';

export const metadata: Metadata = { title: 'About Us' };

const h2Style = { fontFamily: 'var(--f-display)', fontSize: '1.4rem', fontWeight: 400, color: 'var(--Au-hi)', margin: '2.5rem 0 1rem', letterSpacing: '.05em', borderBottom: '1px solid var(--b3)', paddingBottom: '.5rem' } as const;
const pStyle = { color: 'var(--t2)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '1.2rem' } as const;

export default function AboutPage() {
  return (
    <LegalLayout title="About FlowFit" lastUpdated="2026">
      <p style={pStyle}>FlowFit was founded in 2025 with one mission: to make world-class fitness accessible to everyone — at home, on your own schedule, with no excuses.</p>
      <p style={pStyle}>We believe training should be intelligent, not overwhelming. That&apos;s why we combine science-backed programming, AI-powered personalization, and real-time progress tracking into one seamless experience.</p>
      <h2 style={h2Style}>Our Philosophy</h2>
      <p style={pStyle}>Consistency beats intensity. Progress beats perfection. Real results come from showing up day after day.</p>
      <h2 style={h2Style}>Why Athletes Choose FlowFit</h2>
      <ul style={{ listStyle: 'none', marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
        {['No gym required — just you and your body', 'AI that learns from your actual progress', 'Intelligent substitutions and injury-aware modifications', 'Built by athletes, for athletes'].map(item => (
          <li key={item} style={{ ...pStyle, marginBottom: '.5rem', display: 'flex', gap: '.75rem', alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--Au)', marginTop: '.3rem' }}>✓</span> {item}
          </li>
        ))}
      </ul>
      <p style={pStyle}>Today, thousands of dedicated athletes worldwide trust FlowFit to guide their fitness journey from beginner to elite.</p>
      <h2 style={h2Style}>Join the Movement</h2>
      <p style={pStyle}>Whether you&apos;re just starting or chasing new personal records, FlowFit is here to help you move better, train smarter, and become the strongest version of yourself.</p>
    </LegalLayout>
  );
}
