// src/app/legal/LegalLayout.tsx
import Link from 'next/link';
import type { ReactNode } from 'react';

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

export default function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 2.5rem', background: 'rgba(7,6,12,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--b1)', zIndex: 1000 }}>
        <Link href="/" style={{ fontFamily: 'var(--f-display)', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '.25em', color: 'var(--t1)', textDecoration: 'none', textTransform: 'uppercase' }}>
          Flow<span style={{ color: 'var(--Au)' }}>Fit</span>
        </Link>
        <Link href="/" style={{ fontFamily: 'var(--f-display)', fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--t2)', textDecoration: 'none', border: '1px solid var(--b1)', padding: '.6rem 1.2rem', borderRadius: 8, transition: 'all .3s ease' }}>
          Back to Home
        </Link>
      </nav>
      <div style={{ maxWidth: 800, margin: '120px auto 5rem', padding: '0 2rem' }}>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: '2.4rem', fontWeight: 400, color: 'var(--Au)', marginBottom: '.5rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>{title}</h1>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.85rem', color: 'var(--t2)', marginBottom: '3rem', display: 'block' }}>Last updated: {lastUpdated}</span>
        {children}
      </div>
      <footer style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid var(--b3)', color: 'var(--t3)', fontSize: '.85rem' }}>
        <p>© 2026 FlowFit. All rights reserved.</p>
      </footer>
    </>
  );
}
