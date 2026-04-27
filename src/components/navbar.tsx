'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [theme, setTheme]         = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('ff-theme') as 'dark' | 'light' | null;
    if (saved) applyTheme(saved);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function applyTheme(t: 'dark' | 'light') {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('ff-theme', t);
    setTheme(t);
  }

  function toggleTheme() {
    applyTheme(theme === 'dark' ? 'light' : 'dark');
  }

  return (
    <nav id="mainNav" style={{ position: 'sticky', top: 0, zIndex: 999, display: 'flex', alignItems: 'stretch', justifyContent: 'space-between', padding: '0 1.5rem 0 0', background: 'var(--surface)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--Au-12)', height: scrolled ? '56px' : '64px', transition: 'height .3s, background .4s, box-shadow .4s', boxShadow: scrolled ? '0 4px 50px var(--overlay-50)' : 'none' }}>

      {/* Logo */}
      <Link href="/" className="logo-wrap" aria-label="FlowFit">
        <svg width="36" height="36" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lgMark" x1="0" y1="0" x2="46" y2="46" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#EDD87A" />
              <stop offset="55%" stopColor="#C9A84C" />
              <stop offset="100%" stopColor="#8E6E28" />
            </linearGradient>
            <radialGradient id="lgBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1a1830" />
              <stop offset="100%" stopColor="#0c0b18" />
            </radialGradient>
          </defs>
          <circle cx="23" cy="23" r="21.5" fill="url(#lgBg)" />
          <circle cx="23" cy="23" r="20" stroke="url(#lgMark)" strokeWidth="1.4" fill="none" strokeDasharray="78 48" strokeDashoffset="24" strokeLinecap="round" opacity=".45" />
          <polyline points="4,23 9,23 12,23 14,30 17,14 20,28 23,23 27,23 43,23" stroke="url(#lgMark)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <div className="logo-wordmark">
          <span className="logo-flow">Flow</span>
          <span className="logo-fit">Fit</span>
        </div>
      </Link>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>

        {/* Login */}
        <Link href="/auth/login" aria-label="Login" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
          <svg width="104" height="38" viewBox="0 0 104 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="102" height="36" rx="18" fill="none" stroke="var(--Au)" strokeWidth="1.2" strokeOpacity="0.6" />
            <g transform="translate(18,11)">
              <path d="M6 2H2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h4" stroke="var(--Au)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <line x1="7" y1="8" x2="15" y2="8" stroke="var(--Au)" strokeWidth="1.5" strokeLinecap="round" />
              <polyline points="12,5 15,8 12,11" stroke="var(--Au)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
            <text x="60" y="23.5" textAnchor="middle" fontFamily="'Josefin Sans', sans-serif" fontSize="13" fontWeight="300" letterSpacing="2" fill="var(--Au)">LOGIN</text>
          </svg>
        </Link>

        {/* Sign Up */}
        <Link href="/auth/register" aria-label="Sign Up" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
          <svg width="116" height="38" viewBox="0 0 116 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lgSignup" x1="0" y1="0" x2="116" y2="38" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#E8C96A" />
                <stop offset="55%" stopColor="#C9A84C" />
                <stop offset="100%" stopColor="#9A7230" />
              </linearGradient>
            </defs>
            <path d="M10,0 L116,0 L106,38 L0,38 Z" fill="url(#lgSignup)" />
            <line x1="10" y1="0.8" x2="116" y2="0.8" stroke="white" strokeWidth="0.8" strokeOpacity="0.35" />
            <g transform="translate(14,11)">
              <circle cx="7" cy="4" r="3" stroke="#07060c" strokeWidth="1.5" fill="none" />
              <path d="M1 16c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#07060c" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <line x1="16" y1="6" x2="16" y2="12" stroke="#07060c" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="13" y1="9" x2="19" y2="9" stroke="#07060c" strokeWidth="1.5" strokeLinecap="round" />
            </g>
            <text x="71" y="23.5" textAnchor="middle" fontFamily="'Josefin Sans', sans-serif" fontSize="13" fontWeight="400" letterSpacing="2" fill="#07060c">SIGN UP</text>
          </svg>
        </Link>

        {/* Theme toggle */}
        <button onClick={toggleTheme} aria-label="Toggle theme" style={{ background: 'var(--Au-09)', border: '1px solid var(--Au-rim)', color: 'var(--Au)', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, flexShrink: 0, transition: 'all 0.25s' }}>
          {theme === 'dark' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="4.5" />
              <line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" />
              <line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" />
              <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" /><line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
              <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" /><line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E6E28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
      }
