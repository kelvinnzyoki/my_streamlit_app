import DashboardShell from '@/components/DashboardShell';

const plans = [
  ['Free','KES 0','Basic workout access, manual tracking, starter programs'],
  ['Pro','KES 499/mo','AI coach, advanced analytics, full programs, notifications'],
  ['Elite','KES 999/mo','Diet planning, priority features, deeper progress insights']
];

export default function SubscriptionPage() {
  return <DashboardShell><section><p className="eyebrow">Membership</p><h1 className="title">Subscription</h1><div className="grid grid-3">{plans.map(([name, price, desc], i) => <article className="premium-card" key={name} style={{ borderColor:i===1?'var(--Au)':'var(--b1)' }}><p className="eyebrow">{name}</p><h2>{price}</h2><p className="muted">{desc}</p><button className={i===1?'primary-btn':'secondary-btn'}>{i===0?'Current Plan':'Choose Plan'}</button></article>)}</div></section></DashboardShell>;
}
