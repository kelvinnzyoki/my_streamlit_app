'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Save, User } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import { getProfile, updateProfile } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

type ProfileData = {
  firstName?: string; lastName?: string;
  email?: string; phone?: string;
  dob?: string; gender?: string;
  height?: string; weight?: string;
  fitnessGoal?: string; activityLevel?: string;
  name?: string; fullName?: string;
};

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [data, setData] = useState<ProfileData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getProfile()
      .then((p) => {
        if (p) {
          const [firstName = '', lastName = ''] =
            (p.name || p.fullName || '').split(' ');
          setData({ ...p, firstName: p.firstName || firstName, lastName: p.lastName || lastName });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function set(field: keyof ProfileData, val: string) {
    setData((prev) => ({ ...prev, [field]: val }));
    setSaved(false);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const updated = await updateProfile({
        ...data,
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      });
      if (user && (updated?.name || data.firstName)) {
        setUser({ ...user, name: `${data.firstName} ${data.lastName}`.trim() });
      }
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile');
    } finally { setSaving(false); }
  }

  const initial = (user?.name || user?.email || 'F')[0].toUpperCase();

  return (
    <DashboardShell>
      <section className="page-section">
        <p className="eyebrow">Account</p>
        <h1>Profile</h1>

        {/* Avatar row */}
        <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', padding: '1.25rem' }}>
          <div className="brand-mark" style={{ width: 72, height: 72, fontSize: '1.6rem', flexShrink: 0 }}>
            {initial}
          </div>
          <div>
            <h2 style={{ margin: '0 0 0.25rem' }}>{user?.name || user?.fullName || 'FlowFit User'}</h2>
            <p className="muted" style={{ margin: '0 0 0.5rem', fontSize: '0.85rem' }}>{user?.email}</p>
            <div className="pill-row" style={{ margin: 0 }}>
              <span className="pill">{user?.role || 'USER'}</span>
              <span className="pill">{user?.plan || 'Free'} Plan</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="premium-card" style={{ height: 300, opacity: 0.35 }} />
        ) : (
          <form onSubmit={handleSave}>
            {error && <div className="alert" style={{ marginBottom: '1rem' }}>{error}</div>}
            {saved && <div className="success-alert" style={{ marginBottom: '1rem' }}>Profile saved successfully.</div>}

            {/* Personal info */}
            <div className="premium-card" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <User size={16} style={{ color: 'var(--Au)' }} />
                <h2 style={{ margin: 0 }}>Personal Information</h2>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label>First Name</label>
                  <input value={data.firstName || ''} onChange={(e) => set('firstName', e.target.value)} placeholder="First name" />
                </div>
                <div className="field">
                  <label>Last Name</label>
                  <input value={data.lastName || ''} onChange={(e) => set('lastName', e.target.value)} placeholder="Last name" />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input type="email" value={data.email || user?.email || ''} onChange={(e) => set('email', e.target.value)} autoComplete="email" />
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input type="tel" value={data.phone || ''} onChange={(e) => set('phone', e.target.value)} placeholder="+254 7xx xxx xxx" />
                </div>
                <div className="field">
                  <label>Date of Birth</label>
                  <input type="date" value={data.dob || ''} onChange={(e) => set('dob', e.target.value)} />
                </div>
                <div className="field">
                  <label>Gender</label>
                  <select value={data.gender || ''} onChange={(e) => set('gender', e.target.value)}>
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Fitness info */}
            <div className="premium-card" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '1rem' }}>💪</span>
                <h2 style={{ margin: 0 }}>Fitness Details</h2>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label>Height (cm)</label>
                  <input type="number" min="100" max="250" value={data.height || ''} onChange={(e) => set('height', e.target.value)} placeholder="175" />
                </div>
                <div className="field">
                  <label>Weight (kg)</label>
                  <input type="number" min="30" max="300" step="0.1" value={data.weight || ''} onChange={(e) => set('weight', e.target.value)} placeholder="70" />
                </div>
                <div className="field">
                  <label>Primary Goal</label>
                  <select value={data.fitnessGoal || ''} onChange={(e) => set('fitnessGoal', e.target.value)}>
                    <option value="">Select goal</option>
                    <option value="weight_loss">Weight Loss</option>
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="endurance">Endurance</option>
                    <option value="flexibility">Flexibility</option>
                    <option value="general_fitness">General Fitness</option>
                  </select>
                </div>
                <div className="field">
                  <label>Activity Level</label>
                  <select value={data.activityLevel || ''} onChange={(e) => set('activityLevel', e.target.value)}>
                    <option value="">Select level</option>
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Lightly Active</option>
                    <option value="moderate">Moderately Active</option>
                    <option value="very_active">Very Active</option>
                    <option value="athlete">Athlete</option>
                  </select>
                </div>
              </div>
            </div>

            <button className="primary-btn" type="submit" disabled={saving} style={{ display: 'inline-flex', gap: '0.5rem' }}>
              <Save size={16} />
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </form>
        )}
      </section>
    </DashboardShell>
  );
}
