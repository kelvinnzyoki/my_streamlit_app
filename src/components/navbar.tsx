'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <nav className="public-nav ff-public-nav">
      {/* Brand */}
      <Link href="/" className="ff-brand" onClick={closeMenu} aria-label="FlowFit Home">
        <span className="ff-brand-mark" aria-hidden="true">
          <svg className="ff-brand-pulse" width="32" height="32" viewBox="0 0 48 48" fill="none">
            <defs>
              <linearGradient id="flowfitPremiumPulse" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFF1A8" />
                <stop offset="42%" stopColor="#E7C763" />
                <stop offset="100%" stopColor="#8E6E28" />
              </linearGradient>
              <filter id="flowfitPulseGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d="M5 25h8l3.5-10 5 20 5.5-26 5 16h11"
              stroke="url(#flowfitPremiumPulse)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#flowfitPulseGlow)"
            />
          </svg>
        </span>

        <span className="ff-wordmark">
          <span>Flow</span><strong>Fit</strong>
        </span>
      </Link>

      {/* Desktop / mobile dropdown links */}
      <div className={`public-links ff-public-links ${open ? 'public-links-open' : ''}`}>
        <Link href="/auth/login?redirect=/workouts" onClick={closeMenu}>Workouts</Link>
        <Link href="/auth/login?redirect=/programs" onClick={closeMenu}>Programs</Link>
        <Link href="/auth/login?redirect=/dashboard" onClick={closeMenu}>Dashboard</Link>
        <Link href="/about" onClick={closeMenu}>About</Link>
        <ThemeToggle />
        <Link href="/auth/login" className="secondary-btn nav-cta ff-nav-login" onClick={closeMenu}>Login</Link>
        <Link href="/auth/register" className="primary-btn nav-cta ff-nav-start" onClick={closeMenu}>Start Free</Link>
      </div>

      {/* Mobile right controls */}
      <div className="public-nav-actions ff-public-nav-actions">
        <ThemeToggle />
        <button
          type="button"
          className="icon-btn ff-nav-menu-btn"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
    </nav>
  );
}
