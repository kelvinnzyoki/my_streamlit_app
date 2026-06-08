import DashboardShell from '@/components/DashboardShell';
import { getProfile } from '@/lib/api';

export default async function ProfilePage() {
  const profile = await getProfile();
  return <DashboardShell><section className="page-section"><p className="eyebrow">Profile</p><h1>Account & Fitness Identity</h1><div className="premium-card"><div className="brand-mark" style={{ width:84,height:84,fontSize:30 }}>{profile?.name?.[0] || profile?.email?.[0] || 'F'}</div><h2>{profile?.name || profile?.fullName || 'FlowFit User'}</h2><p className="muted">{profile?.email || 'Sign in to sync your profile from the FlowFit server.'}</p><div className="pill-row"><span className="pill">{profile?.role || 'USER'}</span><span className="pill">{profile?.plan || 'Free Plan'}</span></div></div></section></DashboardShell>;
}
