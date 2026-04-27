'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

const features = [
  {
    title: 'Smart Tracking',
    desc: 'Log every rep, set, and workout. Track your progress with detailed analytics and beautiful visualizations that show your improvement over time.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="url(#iA)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="iA" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop stopColor="#E8C96A" /><stop offset="1" stopColor="#C9A84C" /></linearGradient></defs>
        <polyline points="3 17 8 11 13 14 21 6" /><line x1="3" y1="21" x2="21" y2="21" />
      </svg>
    ),
  },
  {
    title: 'Personalized Programs',
    desc: 'Get customized workout plans tailored to your fitness level, goals, and available equipment. Progressive overload built in automatically.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="url(#iB)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="iB" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop stopColor="#E8C96A" /><stop offset="1" stopColor="#C9A84C" /></linearGradient></defs>
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    title: 'Gamification & Streaks',
    desc: 'Stay motivated with daily streaks, achievement badges, and milestone celebrations. Turn your fitness journey into an engaging game.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="url(#iC)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="iC" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop stopColor="#E8C96A" /><stop offset="1" stopColor="#C9A84C" /></linearGradient></defs>
        <path d="M8 21h8m-4-4v4M6 3H4a1 1 0 00-1 1v2a5 5 0 005 5h8a5 5 0 005-5V4a1 1 0 00-1-1h-2M6 3h12v7a6 6 0 01-12 0V3z" />
      </svg>
    ),
  },
  {
    title: 'Mobile Optimized',
    desc: 'Access your workouts anywhere, anytime. Our responsive design works perfectly on all devices, from phone to desktop.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="url(#iD)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="iD" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop stopColor="#E8C96A" /><stop offset="1" stopColor="#C9A84C" /></linearGradient></defs>
        <rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
  {
    title: 'Progress Analytics',
    desc: 'Comprehensive charts and graphs showing your strength gains, workout frequency, calories burned, and body composition changes.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="url(#iE)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="iE" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop stopColor="#E8C96A" /><stop offset="1" stopColor="#C9A84C" /></linearGradient></defs>
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
      </svg>
    ),
  },
  {
    title: 'Premium Content',
    desc: 'Unlock advanced programs, video demonstrations, nutrition guides, and priority support with our premium subscription tiers.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="url(#iF)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="iF" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop stopColor="#E8C96A" /><stop offset="1" stopColor="#C9A84C" /></linearGradient></defs>
        <path d="M2.7 7.5L12 21l9.3-13.5M6.5 2.5h11L21 7.5H3z" />
      </svg>
    ),
  },
];

const plans = [
  {
    tier: 'Free',
    badge: 'Free Trial', badgeClass: 'free-badge',
    price: '$0', period: '/ mo',
    desc: 'Perfect for getting started with guided beginner workouts.',
    features: [
      { ok: true,  text: 'Full beginner exercise library' },
      { ok: true,  text: 'Manual workout logging' },
      { ok: true,  text: 'Basic progress tracking' },
      { ok: true,  text: 'Beginner workout programs' },
      { ok: true,  text: '7-day streak tracker' },
      { ok: true,  text: 'Mobile app access' },
      { ok: false, text: 'Video demonstrations' },
      { ok: false, text: 'Intermediate programs' },
      { ok: false, text: 'Advanced analytics' },
    ],
    cta: 'Get Started Free', ctaClass: 'btn-ghost', featured: false,
  },
  {
    tier: 'Pro',
    badge: 'Pro', badgeClass: 'pro-badge',
    price: '$12', period: '/ mo',
    desc: 'For dedicated athletes ready to level up from beginner to intermediate.',
    features: [
      { ok: true,  text: 'Everything in Free' },
      { ok: true,  text: 'Beginner + Intermediate library' },
      { ok: true,  text: 'Video exercise demos' },
      { ok: true,  text: 'Full workout programs (all levels)' },
      { ok: true,  text: 'Advanced progress analytics' },
      { ok: true,  text: 'Custom workout plan builder' },
      { ok: true,  text: 'Progress charts & insights' },
      { ok: true,  text: 'Priority email support' },
      { ok: false, text: 'AI-generated plans' },
      { ok: false, text: '1-on-1 coaching' },
      { ok: false, text: 'Nutrition tracking' },
    ],
    cta: 'Start 7-Day Pro Trial', ctaClass: 'btn-primary', featured: true,
  },
  {
    tier: 'Premium',
    badge: 'Premium', badgeClass: 'premium-badge',
    price: '$24', period: '/ mo',
    desc: 'The complete FlowFit experience — every feature, every tool, every level.',
    features: [
      { ok: true, text: 'Everything in Pro' },
      { ok: true, text: 'Full advanced exercise library' },
      { ok: true, text: 'AI-generated personalized plans' },
      { ok: true, text: 'Nutrition & macro tracking' },
      { ok: true, text: '1-on-1 coaching calls' },
      { ok: true, text: 'Wearable device integration' },
      { ok: true, text: 'Custom macros & meal planning' },
      { ok: true, text: 'Early access to new features' },
      { ok: true, text: 'White-glove priority support' },
    ],
    cta: 'Go Premium', ctaClass: 'btn-ghost', featured: false,
  },
];

export default function HomePage() {
  // Scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal');
    const io  = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add('visible'); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* Atmosphere */}
      <div className="blob blob-1" aria-hidden="true" />
      <div className="blob blob-2" aria-hidden="true" />
      <div className="blob blob-3" aria-hidden="true" />

      <Navbar />

      {/* ── HERO ──────────────────────────────── */}
      <section className="hero">
        <div className="hero-content">
          <div>
            <div className="hero-eyebrow">
              <span className="eyebrow-pulse" />
              Your Personal Fitness OS
            </div>
            <h1>
              Transform Your Body
              <span className="line-2">at Home</span>
            </h1>
            <p>
              Professional workout tracking, personalized programs, and real-time
              progress analytics. Your fitness journey starts here.
            </p>
            <div className="hero-cta">
              <Link href="/auth/register" className="btn btn-primary">Get Started</Link>
              <a href="#features" className="btn btn-ghost">Explore Features</a>
            </div>
            <div className="hero-trust" style={{ marginTop: '2rem' }}>
              <div className="trust-avatars">
                {['JK','AM','TR','+'].map(av => <div key={av} className="t-av">{av}</div>)}
              </div>
              <div className="trust-text">
                <strong>50,000+ athletes</strong> already crushing their goals
              </div>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="hero-wave" aria-hidden="true">
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,50 C240,100 480,0 720,50 C960,100 1200,10 1440,50 L1440,100 L0,100 Z" className="wave-fill" />
          </svg>
        </div>
      </section>

      {/* ── AI CTA BAND ───────────────────────── */}
      <div className="ai-cta-band">
        <p>Powered by Groq AI</p>
        <button className="btn btn-primary" disabled>✨ Generate AI Workout Plan</button>
        <small>Available inside your Dashboard after signing in</small>
      </div>

      {/* ── STATS ─────────────────────────────── */}
      <section className="stats">
        <div className="stats-grid">
          {[
            { n: '50K+', l: 'Active Users' },
            { n: '2M+',  l: 'Workouts Logged' },
            { n: '150+', l: 'Exercise Library' },
            { n: '98%',  l: 'Satisfaction Rate' },
          ].map((s, i) => (
            <div key={s.l} className={`stat-item reveal${i > 0 ? ` reveal-delay-${i}` : ''}`}>
              <div className="stat-number">{s.n}</div>
              <div className="stat-label">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────── */}
      <section className="features-section" id="features">
        <div className="features-inner">
          <div className="section-header reveal">
            <span className="section-label">Features</span>
            <h2>Everything You Need to Succeed</h2>
            <p>Powerful tools designed to help you achieve your fitness goals faster and smarter</p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={f.title} className={`feature-card reveal${i % 3 > 0 ? ` reveal-delay-${i % 3}` : ''}`}>
                <div className="feat-icon-wrap">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────── */}
      <section className="pricing-section" id="pricing">
        <div className="pricing-inner">
          <div className="section-header reveal">
            <span className="section-label">Pricing</span>
            <h2>Choose Your Plan</h2>
            <p>Start free and upgrade when you&apos;re ready for advanced features</p>
          </div>
          <div className="pricing-grid">
            {plans.map((plan, i) => (
              <div key={plan.tier} className={`pricing-card reveal${i > 0 ? ` reveal-delay-${i}` : ''}${plan.featured ? ' featured' : ''}`}>
                {plan.featured && <div className="pricing-badge">Most Popular</div>}
                <div className="plan-badge-wrap">
                  <span className={`plan-tier-badge ${plan.badgeClass}`}>{plan.badge}</span>
                </div>
                <h3>{plan.tier}</h3>
                <div className="price">{plan.price}<span> {plan.period}</span></div>
                <p className="plan-desc">{plan.desc}</p>
                <ul className="pricing-features">
                  {plan.features.map(f => (
                    <li key={f.text} className={f.ok ? 'feat-available' : 'feat-locked'}>
                      <span className={f.ok ? 'feat-check' : 'feat-cross'}>{f.ok ? '✓' : '✕'}</span>
                      {f.text}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register" className={`btn ${plan.ctaClass} pricing-cta`}>{plan.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
      }
