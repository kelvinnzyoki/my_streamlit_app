// src/app/legal/cookies/page.tsx
import type { Metadata } from 'next';
import LegalLayout from '../LegalLayout';

export const metadata: Metadata = { title: 'Cookie Policy' };

const h2Style = { fontFamily: 'var(--f-display)', fontSize: '1.4rem', fontWeight: 400, color: 'var(--Au-hi)', margin: '2.5rem 0 1rem', letterSpacing: '.05em', borderBottom: '1px solid var(--b3)', paddingBottom: '.5rem' } as const;
const pStyle = { color: 'var(--t2)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '1.2rem' } as const;

export default function CookiesPage() {
  return (
    <LegalLayout title="Cookie Policy" lastUpdated="April 3, 2026">
      <h2 style={h2Style}>What Are Cookies?</h2>
      <p style={pStyle}>Cookies are small text files stored on your device to enhance your experience on FlowFit. They help us remember your preferences and understand how you interact with our platform.</p>
      <h2 style={h2Style}>Cookies We Use</h2>
      <p style={pStyle}><strong style={{ color: 'var(--t1)', fontWeight: 600 }}>Essential Cookies:</strong> Required for login sessions, security, and core app functionality. The app cannot function properly without these.</p>
      <p style={pStyle}><strong style={{ color: 'var(--t1)', fontWeight: 600 }}>Functional Cookies:</strong> Used to remember your specific preferences (e.g., billing interval toggles, dark/light theme selection).</p>
      <p style={pStyle}><strong style={{ color: 'var(--t1)', fontWeight: 600 }}>Analytics Cookies:</strong> Help us understand how you use the app so we can improve performance and feature sets.</p>
      <h2 style={h2Style}>Your Choices</h2>
      <p style={pStyle}>You can manage or block cookies through your browser settings at any time. Please note that blocking essential cookies may affect your ability to log in and save your workout progress.</p>
      <h2 style={h2Style}>Contact Us</h2>
      <p style={pStyle}>If you have any questions about our use of cookies, please email us at <a href="mailto:tam&cc@cctamcc.site" style={{ color: 'var(--Au)', textDecoration: 'none' }}>tam&cc@cctamcc.site</a>.</p>
    </LegalLayout>
  );
}
