import DashboardShell from '@/components/DashboardShell';

export default function AdminPage() {
  return <DashboardShell><section className="page-section"><p className="eyebrow">Admin</p><h1>FlowFit Operations</h1><div className="grid grid-3"><div className="premium-card"><h2>Users</h2><div className="stat-value">—</div><p className="muted">Connect to backend admin endpoint.</p></div><div className="premium-card"><h2>Audits</h2><div className="stat-value">—</div><p className="muted">Moderation and activity logs.</p></div><div className="premium-card"><h2>Revenue</h2><div className="stat-value">—</div><p className="muted">Subscription analytics.</p></div></div></section></DashboardShell>;
}
