import DashboardShell from '@/components/DashboardShell';
import { getSubscription } from '@/lib/api';

export default async function SubscriptionPage() {
  const sub: any = await getSubscription();
  return <DashboardShell><section className="page-section"><p className="eyebrow">Subscription</p><h1>Manage Your FlowFit Plan</h1><div className="grid grid-2"><article className="premium-card"><p className="eyebrow">Current Plan</p><h2>{sub.plan}</h2><p className="muted">Status: {sub.status}</p><div className="metric-row"><span>{sub.renewalDate ? `Renews ${sub.renewalDate}` : 'No active renewal'}</span></div></article><article className="premium-card"><h2>Included Features</h2>{(sub.features || []).map((f:string)=><div className="mini-link" key={f}>{f}</div>)}<button className="primary-btn">Upgrade Plan</button></article></div></section></DashboardShell>;
}
