import DashboardShell from '@/components/DashboardShell';
import { getSubscription } from '@/lib/api';

export default async function SubscriptionPage() {
  const sub: any = await getSubscription().catch(() => null);

  const plan = sub?.plan || 'Free';
  const status = sub?.status || 'Inactive';
  const renewalDate = sub?.renewalDate || sub?.currentPeriodEnd || 'Not scheduled';
  const amount = sub?.amount || sub?.price || 0;

  return (
    <DashboardShell>
      <section className="page-section">
        <p className="eyebrow">Billing</p>
        <h1>Subscription</h1>
        <p className="muted">
          Manage your FlowFit plan, renewal status, and billing access.
        </p>

        <div className="grid grid-2">
          <article className="premium-card">
            <h2>Current Plan</h2>

            <div className="metric-row">
              <span>{plan}</span>
              <span>{status}</span>
            </div>

            <p className="muted">
              Renewal: {renewalDate}
            </p>

            <p className="muted">
              Amount: KES {amount}
            </p>
          </article>

          <article className="premium-card">
            <h2>Upgrade FlowFit</h2>
            <p className="muted">
              Unlock AI coaching, advanced analytics, progress intelligence,
              personalized programs, and planned diet support.
            </p>

            <div className="stack">
              <a className="primary-btn" href="/subscription">
                Choose Plan
              </a>
              <a className="secondary-btn" href="/contact">
                Contact Support
              </a>
            </div>
          </article>
        </div>
      </section>
    </DashboardShell>
  );
}
