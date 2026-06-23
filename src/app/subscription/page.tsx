'use client';

import { useEffect, useState } from 'react';
import { Check, Zap } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import { getSubscription, getPlans, checkoutPlan, cancelSubscription } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Footer from '@/components/footer';

type Plan = {
  id: string; name: string; description?: string;
  monthlyPrice?: number; yearlyPrice?: number;
  price?: number; interval?: string;
  paystackCode?: string; features?: string[];
  isPopular?: boolean;
};

// Fallback plan data in case /plans endpoint isn't ready
const FALLBACK_PLANS: Plan[] = [
  {
    id: 'free', name: 'Free', description: 'Start your fitness journey',
    monthlyPrice: 0, yearlyPrice: 0,
    features: ['21 guided exercises', 'Basic workout library', '3 programs', 'Progress tracking'],
  },
  {
    id: 'pro', name: 'Pro', description: 'Serious training tools',
    monthlyPrice: 999, yearlyPrice: 8999, isPopular: true,
    features: ['All Free features', 'Full workout library', 'All programs', 'Advanced analytics', 'Priority support', 'AI coaching (basic)'],
  },
  {
    id: 'elite', name: 'Elite', description: 'Maximum performance',
    monthlyPrice: 1999, yearlyPrice: 17999,
    features: ['All Pro features', 'Personalised programs', 'Full AI coaching', 'Diet & nutrition plans', 'Weekly check-ins', 'Early access to new features'],
  },
];

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [sub, setSub] = useState<any>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getSubscription(), getPlans()])
      .then(([s, p]) => {
        setSub(s);
        setPlans(p.length ? p : FALLBACK_PLANS);
      })
      .catch(() => { setSub(null); setPlans(FALLBACK_PLANS); })
      .finally(() => setLoading(false));
  }, []);

  async function handleChoosePlan(plan: Plan) {
    if (plan.monthlyPrice === 0) return;
    setError(''); setActionId(plan.id);
    try {
      const { authorizationUrl } = await checkoutPlan(plan.id);
      window.location.href = authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not initiate checkout');
      setActionId(null);
    }
  }

  async function handleCancel() {
    if (!confirm('Cancel your subscription at the end of the billing period?')) return;
    setError(''); setActionId('cancel');
    try {
      await cancelSubscription();
      const updated = await getSubscription();
      setSub(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancellation failed');
    } finally { setActionId(null); }
  }

  const currentPlanName = sub?.plan || user?.plan || 'Free';
  const subStatus = sub?.status || 'active';
  const renewalDate = sub?.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <DashboardShell>
      <section className="page-section">
        <p className="eyebrow">Billing</p>
        <h1>Subscription</h1>
        <p className="muted" style={{ marginBottom: '1.5rem', maxWidth: 520 }}>
          Manage your FlowFit plan. Upgrade anytime — cancel anytime.
        </p>

        {error && <div className="alert" style={{ marginBottom: '1.25rem' }}>{error}</div>}

        {/* ── Current plan banner ── */}
        {!loading && (
          <div className="current-plan-banner">
            <div>
              <p style={{ margin: '0 0 0.4rem', fontSize: '0.82rem', color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Current Plan</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h2 style={{ margin: 0 }}>{currentPlanName}</h2>
                <span className={`status-pill ${subStatus === 'active' ? 'status-active' : subStatus === 'canceled' ? 'status-canceled' : 'status-free'}`}>
                  {subStatus === 'active' ? 'Active' : subStatus === 'canceled' ? 'Canceled' : 'Free'}
                </span>
              </div>
              {renewalDate && (
                <p className="muted" style={{ margin: '0.4rem 0 0', fontSize: '0.82rem' }}>
                  {subStatus === 'canceled' ? 'Access until' : 'Renews'}: {renewalDate}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {subStatus === 'active' && currentPlanName !== 'Free' && (
                <button
                  className="secondary-btn"
                  style={{ fontSize: '0.82rem' }}
                  onClick={handleCancel}
                  disabled={actionId === 'cancel'}
                >
                  {actionId === 'cancel' ? 'Canceling…' : 'Cancel Plan'}
                </button>
              )}
              <a href="/contact" className="secondary-btn" style={{ fontSize: '0.82rem' }}>Contact Support</a>
            </div>
          </div>
        )}

        {/* ── Billing cycle toggle ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
          <button
            className={billing === 'monthly' ? 'primary-btn' : 'secondary-btn'}
            style={{ minHeight: 38, padding: '0.5rem 1.25rem', fontSize: '0.82rem' }}
            onClick={() => setBilling('monthly')}
          >Monthly</button>
          <button
            className={billing === 'yearly' ? 'primary-btn' : 'secondary-btn'}
            style={{ minHeight: 38, padding: '0.5rem 1.25rem', fontSize: '0.82rem' }}
            onClick={() => setBilling('yearly')}
          >
            Yearly
            <span style={{ marginLeft: '0.4rem', fontSize: '0.68rem', background: 'var(--sage-dim)', color: 'var(--sage)', padding: '0.1rem 0.4rem', borderRadius: 6 }}>-25%</span>
          </button>
        </div>

        {/* ── Plan cards ── */}
        {loading ? (
          <div className="grid grid-3">
            {[1,2,3].map((i) => <div key={i} className="premium-card" style={{ height: 420, opacity: 0.35 }} />)}
          </div>
        ) : (
          <div className="grid grid-3">
            {plans.map((plan) => {
              const price = billing === 'yearly' ? (plan.yearlyPrice ?? (plan.monthlyPrice ?? 0) * 10) : (plan.monthlyPrice ?? plan.price ?? 0);
              const isCurrent = currentPlanName.toLowerCase() === plan.name.toLowerCase();
              const isFree = price === 0;

              return (
                <div
                  key={plan.id}
                  className={`plan-card ${plan.isPopular ? 'is-popular' : ''} ${isCurrent ? 'is-current' : ''}`}
                >
                  {plan.isPopular && <span className="popular-badge">POPULAR</span>}
                  {isCurrent && !plan.isPopular && (
                    <span className="popular-badge" style={{ background: 'var(--sage-dim)', color: 'var(--sage)', border: '1px solid var(--sage-30)' }}>CURRENT</span>
                  )}

                  <p className="plan-name">{plan.name}</p>
                  {plan.description && <p className="plan-desc">{plan.description}</p>}

                  <div style={{ marginBottom: '0.25rem' }}>
                    {isFree ? (
                      <span className="price-amount">Free</span>
                    ) : (
                      <span className="price-amount">
                        <span className="currency">KES</span>
                        {price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="price-period">
                    {isFree ? 'forever' : `per ${billing === 'yearly' ? 'year' : 'month'}`}
                    {billing === 'yearly' && !isFree && (
                      <span style={{ color: 'var(--sage)', marginLeft: '0.4rem' }}>
                        (KES {(plan.monthlyPrice ?? 0) * 12 - (plan.yearlyPrice ?? 0)} saved)
                      </span>
                    )}
                  </p>

                  <ul className="feature-list">
                    {(plan.features || []).map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <button className="secondary-btn" style={{ width: '100%' }} disabled>
                      <Check size={14} /> Current Plan
                    </button>
                  ) : isFree ? (
                    <button className="secondary-btn" style={{ width: '100%' }} onClick={handleCancel} disabled={!!actionId}>
                      Downgrade to Free
                    </button>
                  ) : (
                    <button
                      className="primary-btn"
                      style={{ width: '100%' }}
                      onClick={() => handleChoosePlan(plan)}
                      disabled={!!actionId}
                    >
                      {actionId === plan.id ? 'Redirecting…' : (
                        <><Zap size={14} /> {currentPlanName === 'Free' ? 'Upgrade' : 'Switch to'} {plan.name}</>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Guarantee note ── */}
        <p className="muted" style={{ textAlign: 'center', fontSize: '0.8rem', marginTop: '1.5rem' }}>
          Payments processed securely via Paystack · Cancel anytime · No hidden fees
        </p>
      </section>
    </DashboardShell>
  );
}
