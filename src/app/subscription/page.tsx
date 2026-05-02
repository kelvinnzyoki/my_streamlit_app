'use client';
// src/app/subscription/page.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { useAuth } from '@/context/authContext';
import { api } from '@/lib/api';

const plans = [
  {
    id: 'free', name: 'Free', price: 0, period: '/mo',
    desc: 'Perfect for getting started.',
    features: ['Full beginner exercise library', 'Manual workout logging', 'Basic progress tracking', '7-day streak tracker'],
    cta: 'Current Plan', disabled: true,
  },
  {
    id: 'pro', name: 'Pro', price: 12, period: '/mo',
    desc: 'For dedicated athletes.',
    features: ['Everything in Free', 'Video exercise demos', 'All workout programs', 'Advanced analytics', 'Custom plan builder', 'Priority support'],
    cta: 'Upgrade to Pro', featured: true,
  },
  {
    id: 'premium', name: 'Premium', price: 24, period: '/mo',
    desc: 'The complete experience.',
    features: ['Everything in Pro', 'AI-generated plans', 'Nutrition tracking', '1-on-1 coaching', 'Wearable integration', 'White-glove support'],
    cta: 'Go Premium',
  },
];

export default function SubscriptionPage() {
  const { isLoggedIn, loading: authLoading, user, refreshUser } = useAuth();
  const router = useRouter();
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isLoggedIn) router.push('/auth/login');
  }, [authLoading, isLoggedIn, router]);

  const handleSubscribe = async (planId: string) => {
    setSubscribing(planId); setError('');
    try {
      const res = await api.post<{ checkoutUrl?: string }>('/subscriptions/subscribe', { plan: planId, billing });
      if (res.checkoutUrl) window.location.href = res.checkoutUrl;
      else { await refreshUser(); router.push('/dashboard'); }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Subscription failed. Please try again.');
    } finally {
      setSubscribing(null);
    }
  };

  const annualDiscount = 0.83; // 2 months free

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--ink)', padding: '3rem var(--pad-x) 6rem', position: 'relative', zIndex: 2 }}>
        <div className="blob blob-1" aria-hidden="true"/>
        <div className="blob blob-2" aria-hidden="true"/>
        <div style={{ maxWidth: 'var(--col-max)', margin: '0 auto', position: 'relative', zIndex: 2 }}>

          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ display: 'inline-flex', padding: '.36rem 1.1rem', borderRadius: 3, background: 'var(--Au-07)', border: '1px solid var(--b1)', color: 'var(--Au-hi)', fontFamily: 'var(--f-display)', fontSize: '.64rem', fontWeight: 200, letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: '1.3rem' }}>Plans</span>
            <h1 style={{ fontFamily: 'var(--f-serif)', fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(2.2rem,3.8vw,3.8rem)', color: 'var(--t1)', marginBottom: '.9rem' }}>Upgrade Your Journey</h1>
            <p style={{ fontFamily: 'var(--f-display)', fontSize: '.9rem', color: 'var(--t2)', maxWidth: 500, margin: '0 auto 2.5rem', lineHeight: 2 }}>Unlock the tools that serious athletes use to reach new heights</p>

            {/* Billing toggle */}
            <div style={{ display: 'inline-flex', background: 'var(--ink-1)', border: '1px solid var(--b1)', borderRadius: 'var(--r-pill)', padding: '.3rem', gap: '.3rem' }}>
              {(['monthly', 'annual'] as const).map(b => (
                <button key={b} onClick={() => setBilling(b)} style={{ padding: '.5rem 1.4rem', borderRadius: 'var(--r-pill)', border: 'none', background: billing === b ? 'var(--g-Au)' : 'transparent', color: billing === b ? 'var(--ink)' : 'var(--t2)', fontFamily: 'var(--f-display)', fontSize: '.75rem', fontWeight: 400, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all .25s ease' }}>
                  {b} {b === 'annual' && <span style={{ color: billing === 'annual' ? 'var(--ink)' : 'var(--sage)', fontSize: '.6rem' }}>−17%</span>}
                </button>
              ))}
            </div>
          </div>

          {error && <div style={{ background: 'var(--red-10)', border: '1px solid var(--red-30)', borderRadius: 8, padding: '.75rem 1.5rem', color: 'var(--red)', fontFamily: 'var(--f-display)', fontSize: '.88rem', textAlign: 'center', marginBottom: '2rem' }}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
            {plans.map(plan => {
              const isCurrentPlan = user?.subscription === plan.id;
              const displayPrice = plan.price === 0 ? 0 : billing === 'annual' ? Math.round(plan.price * annualDiscount) : plan.price;

              return (
                <div key={plan.id} style={{
                  background: 'var(--g-card)', borderRadius: 'var(--r-card)', padding: '2.5rem',
                  border: plan.featured ? '1px solid var(--Au-38)' : '1px solid var(--b1)',
                  transform: plan.featured ? 'translateY(-12px)' : undefined,
                  boxShadow: plan.featured ? '0 32px 80px var(--overlay-60), 0 0 80px var(--Au-12)' : undefined,
                  position: 'relative', overflow: 'hidden',
                }}>
                  {plan.featured && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--g-Au)' }}/>}
                  {plan.featured && (
                    <div style={{ background: 'var(--g-Au)', color: 'var(--ink)', padding: '.28rem 1.1rem', borderRadius: 3, fontFamily: 'var(--f-display)', fontSize: '.6rem', fontWeight: 400, letterSpacing: '.14em', textTransform: 'uppercase', display: 'inline-block', marginBottom: '1rem' }}>Most Popular</div>
                  )}
                  {isCurrentPlan && (
                    <div style={{ background: 'var(--sage-dim)', color: 'var(--sage)', border: '1px solid var(--sage-20)', padding: '.28rem 1.1rem', borderRadius: 3, fontFamily: 'var(--f-display)', fontSize: '.6rem', fontWeight: 400, letterSpacing: '.14em', textTransform: 'uppercase', display: 'inline-block', marginBottom: '1rem' }}>Current Plan</div>
                  )}
                  <h2 style={{ fontFamily: 'var(--f-serif)', fontWeight: 300, fontStyle: 'italic', fontSize: '2rem', color: 'var(--t1)', marginBottom: '.25rem' }}>{plan.name}</h2>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: '2.8rem', fontWeight: 300, letterSpacing: '-.05em', background: 'var(--g-Au)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, margin: '1rem 0 .25rem' }}>
                    ${displayPrice}<span style={{ fontSize: '.82rem', fontFamily: 'var(--f-display)', fontWeight: 200, WebkitTextFillColor: 'var(--t2)', color: 'var(--t2)', letterSpacing: '.02em' }}>/mo</span>
                  </div>
                  {billing === 'annual' && plan.price > 0 && (
                    <div style={{ fontFamily: 'var(--f-display)', fontSize: '.72rem', color: 'var(--sage)', marginBottom: '.5rem' }}>Billed as ${Math.round(displayPrice * 12)}/yr — 2 months free</div>
                  )}
                  <p style={{ fontFamily: 'var(--f-display)', fontSize: '.82rem', color: 'var(--t2)', lineHeight: 1.8, marginBottom: '1.5rem' }}>{plan.desc}</p>
                  <ul style={{ listStyle: 'none', marginBottom: '2rem' }}>
                    {plan.features.map(feat => (
                      <li key={feat} style={{ display: 'flex', gap: '.65rem', alignItems: 'flex-start', padding: '.45rem 0', borderBottom: '1px solid var(--b3)', fontFamily: 'var(--f-display)', fontSize: '.82rem', color: 'var(--t4)', lineHeight: 1.62 }}>
                        <span style={{ color: 'var(--sage)', marginTop: '.1rem' }}>✓</span> {feat}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => !isCurrentPlan && handleSubscribe(plan.id)}
                    disabled={isCurrentPlan || subscribing === plan.id}
                    style={{ width: '100%', padding: '1rem', background: isCurrentPlan ? 'var(--Au-07)' : plan.featured ? 'var(--g-Au)' : 'var(--Au-10)', border: plan.featured ? 'none' : '1px solid var(--b1)', borderRadius: 10, color: isCurrentPlan ? 'var(--t3)' : plan.featured ? 'var(--ink)' : 'var(--Au-hi)', fontFamily: 'var(--f-display)', fontSize: '.82rem', fontWeight: 400, letterSpacing: '.1em', textTransform: 'uppercase', cursor: isCurrentPlan ? 'default' : 'pointer', transition: 'all .3s ease', boxShadow: plan.featured && !isCurrentPlan ? '0 6px 20px var(--Au-30)' : 'none', opacity: subscribing === plan.id ? .7 : 1 }}>
                    {subscribing === plan.id ? 'Processing...' : isCurrentPlan ? 'Current Plan' : plan.cta}
                  </button>
                </div>
              );
            })}
          </div>

          <p style={{ textAlign: 'center', marginTop: '3rem', fontFamily: 'var(--f-display)', fontSize: '.8rem', color: 'var(--t3)' }}>
            Questions? <Link href="/contact" style={{ color: 'var(--Au)', textDecoration: 'none' }}>Contact our team</Link> · Cancel anytime
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
                       }
                               
