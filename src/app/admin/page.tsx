import DashboardShell from '@/components/DashboardShell';

const rows = ['Users','Subscriptions','Workouts','Programs','Feedback','Activity'];

export default function AdminPage() {
  return <DashboardShell><section><p className="eyebrow">Admin</p><h1 className="title">Admin Dashboard</h1><div className="grid stats"><article className="card"><p className="muted">Users</p><div className="stat-value">1,204</div></article><article className="card"><p className="muted">Active Subs</p><div className="stat-value">318</div></article><article className="card"><p className="muted">Workouts</p><div className="stat-value">8,910</div></article><article className="card"><p className="muted">Feedback</p><div className="stat-value">27</div></article></div><div className="premium-card" style={{ marginTop:'2rem' }}><p className="eyebrow">Management Tabs</p><div className="filter-bar">{rows.map((r) => <button className="secondary-btn" key={r}>{r}</button>)}</div><p className="muted">Connect these panels to your existing AdminAPI endpoints when backend auth is ready.</p></div></section></DashboardShell>;
}
