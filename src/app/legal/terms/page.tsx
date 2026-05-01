// src/app/legal/terms/page.tsx
import type { Metadata } from 'next';
import LegalLayout from '../LegalLayout';

export const metadata: Metadata = { title: 'Terms of Service' };

const h2Style = { fontFamily: 'var(--f-display)', fontSize: '1.4rem', fontWeight: 400, color: 'var(--Au-hi)', margin: '2.5rem 0 1rem', letterSpacing: '.05em', borderBottom: '1px solid var(--b3)', paddingBottom: '.5rem' } as const;
const pStyle = { color: 'var(--t2)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '1.2rem' } as const;

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="April 3, 2026">
      <p style={pStyle}>By using FlowFit, you agree to these Terms. Please read them carefully.</p>
      <h2 style={h2Style}>1. Acceptance of Terms</h2>
      <p style={pStyle}>Accessing or using the Service means you accept these Terms. If you do not agree, you must not use FlowFit.</p>
      <h2 style={h2Style}>2. Health Disclaimer</h2>
      <p style={pStyle}>FlowFit provides fitness guidance for informational purposes only. It is not a substitute for professional medical advice. Exercise involves risk of injury. Consult your physician before starting any program.</p>
      <h2 style={h2Style}>3. Eligibility</h2>
      <p style={pStyle}>You must be at least 13 years old. Users under 18 require parental consent.</p>
      <h2 style={h2Style}>4. Subscriptions & Payments</h2>
      <p style={pStyle}>Subscriptions auto-renew. You are responsible for all charges. No refunds for partial periods unless required by law.</p>
      <h2 style={h2Style}>5. Intellectual Property</h2>
      <p style={pStyle}>All content, AI-generated plans, and designs belong to FlowFit. You may not copy or distribute them without permission.</p>
      <h2 style={h2Style}>6. Limitation of Liability</h2>
      <p style={pStyle}>FlowFit is provided &quot;as is&quot;. We are not liable for any indirect or consequential damages.</p>
      <h2 style={h2Style}>7. Governing Law</h2>
      <p style={pStyle}>These Terms are governed by the laws of Kenya.</p>
      <h2 style={h2Style}>Contact Us</h2>
      <p style={pStyle}>Questions? Email us at <a href="mailto:tam&cc@cctamcc.site" style={{ color: 'var(--Au)', textDecoration: 'none' }}>tam&cc@cctamcc.site</a></p>
    </LegalLayout>
  );
}
