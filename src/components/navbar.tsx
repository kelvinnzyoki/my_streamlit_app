'use client';
// src/components/navbar.tsx
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/authContext';

export default function Navbar() {
  const { isLoggedIn, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (saved) { setTheme(saved); document.documentElement.setAttribute('data-theme', saved); }
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  return (
    <nav id="mainNav" style={{
      position: 'sticky', top: 0, zIndex: 999,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 1.5rem 0 0', gap: '1.5rem',
      background: 'var(--surface)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--Au-12)', height: 64,
      boxShadow: scrolled ? '0 4px 50px var(--overlay-50)' : 'none',
      transition: 'box-shadow 0.4s ease',
    }}>
      <Link href="/" style={{
        display: 'flex', alignItems: 'center', gap: '.85rem',
        textDecoration: 'none', flexShrink: 0, padding: '0 1rem',
        height: '100%', borderLeft: '3px solid var(--Au)',
      }}>
        <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
          <defs>
            <linearGradient id="lgMark" x1="0" y1="0" x2="46" y2="46" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E8C96A"/>
              <stop offset="55%" stopColor="#C9A84C"/>
              <stop offset="100%" stopColor="#8E6E28"/>
            </linearGradient>
            <linearGradient id="lgBg" x1="0" y1="0" x2="46" y2="46" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1c1306"/>
              <stop offset="100%" stopColor="#0e0c1a"/>
            </linearGradient>
          </defs>
          <circle cx="23" cy="23" r="21.5" fill="url(#lgBg)"/>
          <circle cx="23" cy="23" r="20" stroke="url(#lgMark)" strokeWidth="1.4" fill="none" strokeDasharray="78 48" strokeDashoffset="24" strokeLinecap="round" opacity=".45"/>
          <polyline points="4,23 9,23 12,23 14,30 17,14 20,28 23,23 27,23 43,23" stroke="url(#lgMark)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.05rem', lineHeight: 1 }}>
          <span style={{ fontFamily: 'var(--f-display)', fontWeight: 200, fontSize: '1.05rem', letterSpacing: '.42em', textTransform: 'uppercase', color: 'var(--Au-hi)' }}>Flow</span>
          <span style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: '.72rem', letterSpacing: '.58em', textTransform: 'uppercase', color: 'var(--Au)', opacity: .85 }}>Fit</span>
        </div>
      </Link>

      <ul style={{ display: 'flex', gap: '2.5rem', listStyle: 'none', alignItems: 'center', marginLeft: 'auto' }} className="nav-links-desktop">
        {[['/#features', 'Features'], ['/#pricing', 'Pricing'], ['/programs', 'Programs'], ['/blog', 'Blog'], ['/about', 'About']].map(([href, label]) => (
          <li key={href}>
            <Link href={href} style={{ color: 'var(--t2)', textDecoration: 'none', fontSize: '.82rem', fontWeight: 300, letterSpacing: '.05em', textTransform: 'uppercase', transition: 'color .25s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--t1)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--t2)')}>
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        {isLoggedIn ? (
          <Link href="/dashboard" style={{
            display: 'inline-flex', alignItems: 'center', gap: '.5rem',
            padding: '.55rem 1.2rem', borderRadius: 'var(--r-sm)',
            background: 'var(--g-Au)', color: 'var(--ink)',
            fontFamily: 'var(--f-display)', fontSize: '.75rem', fontWeight: 400,
            letterSpacing: '.1em', textTransform: 'uppercase', textDecoration: 'none',
          }}>
            Dashboard
          </Link>
        ) : (
          <>
            <Link href="/auth/login" style={{
              padding: '.55rem 1.2rem', borderRadius: 'var(--r-sm)',
              border: '1px solid var(--Au-35)', color: 'var(--Au-hi)',
              fontFamily: 'var(--f-display)', fontSize: '.75rem', fontWeight: 300,
              letterSpacing: '.1em', textTransform: 'uppercase', textDecoration: 'none',
              transition: 'all .25s',
            }}>Login</Link>
            <Link href="/auth/register" style={{
              padding: '.55rem 1.4rem', borderRadius: 'var(--r-sm)',
              background: 'var(--g-Au)', color: 'var(--ink)',
              fontFamily: 'var(--f-display)', fontSize: '.75rem', fontWeight: 400,
              letterSpacing: '.1em', textTransform: 'uppercase', textDecoration: 'none',
            }}>Sign Up</Link>
          </>
        )}
        <button onClick={toggleTheme} style={{
          background: 'var(--Au-09)', border: '1px solid var(--Au-rim)',
          color: 'var(--Au)', width: 36, height: 36, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', padding: 0, flexShrink: 0, transition: 'all .25s',
        }} aria-label="Toggle theme">
          {theme === 'dark' ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="4.5"/>
              <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
              <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
              <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
              <line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
        }
