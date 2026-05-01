// src/app/legal/privacy/page.tsx
import type { Metadata } from 'next';
import LegalLayout from '../LegalLayout';

export const metadata: Metadata = { title: 'Privacy Policy' };

const h2Style = { fontFamily: 'var(--f-display)', fontSize: '1.4rem', fontWeight: 400, color: 'var(--Au-hi)', margin: '2.5rem 0 1rem', letterSpacing: '.05em', borderBottom: '1px solid var(--b3)', paddingBottom: '.5rem' } as const;
const pStyle = { color: 'var(--t2)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '1.2rem' } as const;

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="April 3, 2026">
      <p style={pStyle}>FlowFit is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information.</p>
      <h2 style={h2Style}>1. Information We Collect</h2>
      <p style={pStyle}><strong style={{ color: 'var(--t1)', fontWeight: 600 }}>Personal Information:</strong> name, email, hashed password, subscription and payment data.</p>
      <p style={pStyle}><strong style={{ color: 'var(--t1)', fontWeight: 600 }}>Fitness Data:</strong> workout logs, progress, streaks, and achievements.</p>
      <p style={pStyle}><strong style={{ color: 'var(--t1)', fontWeight: 600 }}>Technical Data:</strong> device information, IP address, usage analytics.</p>
      <h2 style={h2Style}>2. How We Use Your Information</h2>
      <p style={pStyle}>To provide and improve the Service, process payments, send important updates, and ensure security. We <strong style={{ color: 'var(--t1)', fontWeight: 600 }}>do not sell</strong> your personal data to third parties.</p>
      <h2 style={h2Style}>3. Data Sharing</h2>
      <p style={pStyle}>We only share data with trusted partners (Stripe, M-Pesa, hosting providers) under strict agreements to facilitate payment and host our application securely.</p>
      <h2 style={h2Style}>4. Your Rights</h2>
      <p style={pStyle}>You can access, correct, or delete your data at any time by contacting us.</p>
      <h2 style={h2Style}>Contact Us</h2>
      <p style={pStyle}>Email us at <a href="mailto:tam&cc@cctamcc.site" style={{ color: 'var(--Au)', textDecoration: 'none' }}>tam&cc@cctamcc.site</a>.</p>
    </LegalLayout>
  );
}
