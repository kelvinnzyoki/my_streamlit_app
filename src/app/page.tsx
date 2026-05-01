'use client';
// src/app/page.tsx
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

const features = [
  { icon: 'M3 17 8 11 13 14 21 6 M3 21 21 21', title: 'Smart Tracking', desc: 'Log every rep, set, and workout. Track your progress with detailed analytics and beautiful visualizations that show your improvement over time.' },
  { icon: 'M12 2A10 10 0 1 0 12 22A10 10 0 0 0 12 2ZM12 8A4 4 0 1 0 12 16A4 4 0 0 0 12 8ZM12 10A2 2 0 1 0 12 14A2 2 0 0 0 12 10Z', title: 'Personalized Programs', desc: 'Get customized workout plans tailored to your fitness level, goals, and available equipment. Progressive overload built in automatically.' },
  { icon: 'M8 21h8m-4-4v4M6 3H4a1 1 0 00-1 1v2a5 5 0 005 5h8a5 5 0 005-5V4a1 1 0 00-1-1h-2M6 3h12v7a6 6 0 01-12 0V3z', title: 'Gamification & Streaks', desc: 'Stay motivated with daily streaks, achievement badges, and milestone celebrations. Turn your fitness journey into an engaging game.' },
  { icon: 'M5 2h14a2 2 0 012 2v18l-7-3-7 3V4a2 2 0 012-2z', title: 'Mobile Optimized', desc: 'Access your workouts anywhere, anytime. Our responsive design works perfectly on all devices, from phone to desktop.' },
  { icon: 'M18 20 18 10 M12 20 12 4 M6 20 6 14 M2 20 22 20', title: 'Progress Analytics', desc: 'Comprehensive charts and graphs showing your strength gains, workout frequency, calories burned, and body composition changes.' },
  { icon: 'M2.7 7.5L12 21l9.3-13.5M6.5 2.5h11L21 7.5H3z', title: 'Premium Content', desc: 'Unlock advanced programs, video demonstrations, nutrition guides, and priority support with our premium subscription tiers.' },
];

const stats = [
  { num: '50K+', label: 'Active Users' },
  { num: '2M+', label: 'Workouts Logged' },
  { num: '150+', label: 'Exercise Library' },
  { num: '98%', label: 'Satisfaction Rate' },
];

const plans = [
  {
    tier: 'Free', tierClass: 'free', price: '$0', period: '/mo',
    desc: 'Perfect for getting started with guided beginner workouts.',
    features: [
      { ok: true, text: 'Full beginner exercise library' },
      { ok: true, text: 'Manual workout logging' },
      { ok: true, text: 'Basic progress tracking' },
      { ok: true, text: 'Beginner workout programs' },
      { ok: true, text: '7-day streak tracker' },
      { ok: true, text: 'Mobile app access' },
      { ok: false, text: 'Video demonstrations' },
      { ok: false, text: 'Intermediate programs' },
      { ok: false, text: 'Advanced analytics' },
    ],
    cta: 'Get Started Free', ctaStyle: 'ghost', href: '/auth/register',
  },
  {
    tier: 'Pro', tierClass: 'pro', price: '$12', period: '/mo', featured: true, badge: 'Most Popular',
    desc: 'For dedicated athletes ready to level up from beginner to intermediate.',
    features: [
      { ok: true, text: 'Everything in Free' },
      { ok: true, text: 'Beginner + Intermediate library' },
      { ok: true, text: 'Video exercise demos' },
      { ok: true, text: 'Full workout programs (all levels)' },
      { ok: true, text: 'Advanced progress analytics' },
      { ok: true, text: 'Custom workout plan builder' },
      { ok: true, text: 'Priority email support' },
      { ok: false, text: 'AI-generated plans' },
      { ok: false, text: '1-on-1 coaching' },
    ],
    cta: 'Start 7-Day Pro Trial', ctaStyle: 'primary', href: '/auth/register',
  },
  {
    tier: 'Premium', tierClass: 'premium', price: '$24', period: '/mo',
    desc: 'The complete FlowFit experience — every feature, every tool, every level.',
    features: [
      { ok: true, text: 'Everything in Pro' },
      { ok: true, text: 'Full advanced exercise library' },
      { ok: true, text: 'AI-generated personalized plans' },
      { ok: true, text: 'Nutrition & macro tracking' },
      { ok: true, text: '1-on-1 coaching calls' },
      { ok: true, text: 'Wearable device integration' },
      { ok: true, text: 'Custom macros & meal planning' },
      { ok: true, text: 'White-glove priority support' },
    ],
    cta: 'Go Premium', ctaStyle: 'ghost', href: '/auth/register',
  },
];

export default function HomePage() {
  return (
    <>
      <div className="blob blob-1" aria-hidden="true"/>
      <div className="blob blob-2" aria-hidden="true"/>
      <div className="blob blob-3" aria-hidden="true"/>
      <Navbar/>

      {/* ── HERO */}
      <section style={{ position: 'relative', minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 1.5rem 4rem', overflow: 'hidden', backgroundImage: "url('/images/fit.webp')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to bottom, #07060c 0%, transparent 18%), linear-gradient(to top, #07060c 0%, transparent 22%), linear-gradient(to right, #07060c 0%, transparent 20%), linear-gradient(to left, #07060c 0%, transparent 20%), rgba(7,6,12,0.28)' }}/>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 'var(--col-max)', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '2rem', padding: '5rem 2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.65rem', padding: '.4rem 1.1rem', borderRadius: '9999px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.14)', color: 'var(--Au-hi)', fontSize: '.65rem', fontWeight: 200, letterSpacing: '.16em', textTransform: 'uppercase', animation: 'slideUp .9s var(--ease) both' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--Au)', animation: 'pulse 2.8s ease-in-out infinite' }}/>
            Your Personal Fitness OS
          </div>
          <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 200, fontSize: 'clamp(3rem, 6.5vw, 7rem)', lineHeight: .98, letterSpacing: '-.01em', color: '#1a1a1a', animation: 'slideUp .9s var(--ease) .1s both' }}>
            Transform Your Body
            <span style={{ display: 'block', fontWeight: 400, background: 'linear-gradient(135deg, #8E6E28 0%, #C9A84C 50%, #8E6E28 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>at Home</span>
          </h1>
          <p style={{ fontFamily: 'var(--f-display)', fontWeight: 300, fontSize: '1.05rem', color: '#404040', maxWidth: 520, marginBottom: '0.5rem', lineHeight: 1.75 }}>
            Professional workout tracking, personalized programs, and real-time progress analytics. Your fitness journey starts here.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', animation: 'slideUp .9s var(--ease) .32s both' }}>
            <Link href="/auth/register" className="btn btn-primary">Get Started Free</Link>
            <Link href="#features" className="btn btn-ghost">Explore Features</Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', animation: 'slideUp .9s var(--ease) .48s both' }}>
            <div style={{ display: 'flex' }}>
              {['JK','AM','TR','+'].map((t, i) => (
                <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--ink)', background: 'var(--g-Au)', color: 'var(--ink)', fontSize: '.58rem', fontWeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-display)', marginLeft: i > 0 ? -9 : 0 }}>{t}</div>
              ))}
            </div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: '.74rem', color: '#333', lineHeight: 1.45, fontWeight: 300 }}>
              <strong style={{ color: '#8E6E28', fontWeight: 300, display: 'block', letterSpacing: '.03em' }}>50,000+ athletes</strong>
              already crushing their goals
            </div>
          </div>
        </div>
      </section>

      {/* ── AI CTA BAND */}
      <div style={{ textAlign: 'center', padding: '2.5rem var(--pad-x)', background: 'var(--ink-1)', borderTop: '1px solid var(--b1)', borderBottom: '1px solid var(--b1)', position: 'relative', zIndex: 2 }}>
        <p style={{ fontFamily: 'var(--f-display)', fontSize: '0.75rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--t2)', marginBottom: '1rem', fontWeight: 200 }}>Powered by Grok AI</p>
        <Link href="/dashboard" className="btn btn-primary" style={{ opacity: .75, pointerEvents: 'none' }}>✨ Generate AI Workout Plan</Link>
        <p style={{ fontFamily: 'var(--f-display)', fontSize: '.68rem', letterSpacing: '.10em', color: 'var(--t3)', marginTop: '.75rem', fontWeight: 200 }}>Available inside your Dashboard after signing in</p>
      </div>

      {/* ── STATS */}
      <section style={{ padding: '5.5rem var(--pad-x)', position: 'relative', zIndex: 2, borderTop: '1px solid var(--b1)', borderBottom: '1px solid var(--b1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.6rem', maxWidth: 'var(--col-max)', margin: '0 auto' }}>
          {stats.map(({ num, label }) => (
            <div key={label} style={{ textAlign: 'center', padding: '2.4rem 1.5rem', background: 'var(--ink-1)' }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontWeight: 300, fontSize: 'clamp(2rem,3vw,2.8rem)', letterSpacing: '-.04em', lineHeight: 1, marginBottom: '.4rem', background: 'var(--g-Au)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{num}</div>
              <div style={{ fontFamily: 'var(--f-display)', color: 'var(--t2)', fontSize: '.76rem', fontWeight: 300, letterSpacing: '.08em', textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES */}
      <section id="features" style={{ padding: '9rem var(--pad-x)', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 'var(--col-max)', margin: '0 auto' }}>
          <div className="section-header">
            <span className="section-label">Features</span>
            <h2>Everything You Need to Succeed</h2>
            <p>Powerful tools designed to help you achieve your fitness goals faster and smarter</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {features.map(({ title, desc, icon }) => (
              <div key={title} style={{ background: 'var(--ink-1)', padding: '2.4rem 2.2rem', position: 'relative', transition: 'background .4s ease' }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--ink-2)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--ink-1)'}>
                <div style={{ width: 54, height: 54, borderRadius: 'var(--r-sm)', background: 'var(--Au-09)', border: '1px solid var(--b1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.4rem' }}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="var(--Au)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={icon}/>
                  </svg>
                </div>
                <h3 style={{ fontFamily: 'var(--f-display)', fontSize: '1rem', fontWeight: 300, letterSpacing: '.04em', marginBottom: '.75rem', color: 'var(--t1)', textTransform: 'uppercase' }}>{title}</h3>
                <p style={{ fontFamily: 'var(--f-display)', color: 'var(--t2)', fontSize: '.85rem', fontWeight: 300, lineHeight: 1.9, letterSpacing: '.02em' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING */}
      <section id="pricing" style={{ padding: '10rem var(--pad-x) 11rem', position: 'relative', zIndex: 2, background: 'var(--ink-1)', borderTop: '1px solid var(--b1)', borderBottom: '1px solid var(--b1)' }}>
        <div style={{ maxWidth: 'var(--col-max)', margin: '0 auto' }}>
          <div className="section-header">
            <span className="section-label">Pricing</span>
            <h2>Choose Your Plan</h2>
            <p>Start free and upgrade when you're ready for advanced features</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
            {plans.map(plan => (
              <div key={plan.tier} style={{
                background: 'var(--g-card)', borderRadius: 'var(--r-card)', padding: '2.4rem',
                border: plan.featured ? '1px solid var(--Au-38)' : '1px solid var(--b1)',
                transform: plan.featured ? 'translateY(-16px)' : undefined,
                boxShadow: plan.featured ? '0 0 0 1px var(--Au-mist), 0 32px 80px var(--overlay-70), 0 0 100px var(--Au-15)' : undefined,
                position: 'relative', overflow: 'hidden',
                transition: 'transform .4s var(--ease), box-shadow .4s var(--ease)',
              }}>
                {plan.featured && plan.badge && (
                  <div style={{ background: 'var(--g-Au)', color: 'var(--ink)', padding: '.3rem 1.2rem', borderRadius: '0 0 6px 6px', fontFamily: 'var(--f-display)', fontSize: '.62rem', fontWeight: 400, letterSpacing: '.14em', textTransform: 'uppercase', display: 'inline-block', marginBottom: '1.2rem' }}>
                    {plan.badge}
                  </div>
                )}
                <span style={{ display: 'inline-block', padding: '.28rem .85rem', borderRadius: '3px', fontFamily: 'var(--f-display)', fontSize: '.62rem', fontWeight: 300, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '.8rem', background: plan.tierClass === 'free' ? 'var(--sage-dim)' : plan.tierClass === 'pro' ? 'var(--Au-12)' : 'var(--Au-15)', color: plan.tierClass === 'free' ? 'var(--sage)' : 'var(--Au-hi)', border: `1px solid ${plan.tierClass === 'free' ? 'var(--sage-20)' : 'var(--b1)'}` }}>
                  {plan.tier}
                </span>
                <h3 style={{ fontFamily: 'var(--f-serif)', fontWeight: 300, fontStyle: 'italic', fontSize: '2rem', letterSpacing: '-.01em', color: 'var(--t1)', marginBottom: '.2rem' }}>{plan.tier}</h3>
                <div style={{ fontFamily: 'var(--f-mono)', fontWeight: 300, fontSize: '2.8rem', letterSpacing: '-.05em', margin: '1rem 0 .2rem', lineHeight: 1, background: 'var(--g-Au)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'block' }}>
                  {plan.price}<span style={{ fontSize: '.82rem', fontFamily: 'var(--f-display)', fontWeight: 200, WebkitTextFillColor: 'var(--t2)', color: 'var(--t2)', letterSpacing: '.02em' }}>{plan.period}</span>
                </div>
                <p style={{ fontFamily: 'var(--f-display)', fontSize: '.82rem', fontWeight: 300, color: 'var(--t2)', lineHeight: 1.82, marginBottom: '1.4rem', letterSpacing: '.02em' }}>{plan.desc}</p>
                <ul style={{ listStyle: 'none', marginBottom: '1.4rem', display: 'flex', flexDirection: 'column' }}>
                  {plan.features.map(({ ok, text }) => (
                    <li key={text} style={{ padding: '.48rem 0', borderBottom: '1px solid var(--b3)', display: 'flex', alignItems: 'flex-start', gap: '.7rem', fontFamily: 'var(--f-display)', fontSize: '.82rem', fontWeight: 300, color: ok ? 'var(--t4)' : 'var(--t3)', lineHeight: 1.62, letterSpacing: '.02em' }}>
                      <span style={{ color: ok ? 'var(--sage)' : 'var(--t3)', fontSize: '.7rem', marginTop: '.2rem', opacity: ok ? 1 : .6 }}>{ok ? '✓' : '✕'}</span>
                      {text}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={`btn ${plan.ctaStyle === 'primary' ? 'btn-primary' : 'btn-ghost'}`} style={{ display: 'block', textAlign: 'center', width: '100%', marginTop: '1.6rem' }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer/>
    </>
  );
                             }
