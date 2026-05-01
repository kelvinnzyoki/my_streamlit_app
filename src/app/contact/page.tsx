// src/app/contact/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export const metadata: Metadata = { title: 'Contact Us' };

const contacts = [
  { title: 'Technical Support', desc: 'Having trouble with your account, workouts, or billing? Reach out to our support team.', links: [{ label: 'Email:', href: 'mailto:tam&cc@cctamcc.site', text: 'tam&cc@cctamcc.site' }], note: 'Replies typically within 12 hours (Mon–Fri).' },
  { title: 'Business & Partnerships', desc: 'Interested in collaborating or discussing business opportunities?', links: [{ label: 'Email:', href: 'mailto:kelvinnzyokimaitha@gmail.com', text: 'kelvinnzyokimaitha@gmail.com' }] },
  { title: 'Follow Our Journey', desc: 'Stay updated on new features and fitness tips.', links: [{ label: 'Twitter/X:', href: 'https://twitter.com/Kelvinmaitha2', text: '@Kelvinmaitha2' }] },
  { title: 'Social Media & Community', desc: 'Follow us for daily motivation, workout tips, live sessions, and community discussions.', links: [
    { label: 'Instagram:', href: 'https://www.instagram.com/kamwwana', text: '@Kamwwana' },
    { label: 'WhatsApp:', href: 'https://wa.me/254789574634', text: '+254 789574634' },
    { label: 'Reddit:', href: 'https://www.reddit.com/user/INVENTORCEO', text: 'r/INVENTORCEO' },
    { label: 'LinkedIn:', href: 'https://www.linkedin.com/in/nzioki-maitha', text: 'nzioki-maitha' },
  ]},
];

const cardStyle: React.CSSProperties = { background: 'var(--g-card)', border: '1px solid var(--b1)', borderRadius: 16, padding: '2rem', transition: 'transform .3s ease, border-color .3s ease' };

export default function ContactPage() {
  return (
    <>
      <Navbar/>
      <div style={{ maxWidth: 700, margin: '120px auto 5rem', padding: '0 2rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: '2.8rem', fontWeight: 300, color: 'var(--t1)', marginBottom: '1rem' }}>Get in Touch</h1>
        <p style={{ color: 'var(--t2)', fontSize: '1.1rem', marginBottom: '4rem' }}>Have a question or need assistance? We&apos;d love to hear from you.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', textAlign: 'left' }}>
          {contacts.map(card => (
            <div key={card.title} style={cardStyle}
              onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-4px)'; el.style.borderColor = 'var(--Au)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = ''; el.style.borderColor = 'var(--b1)'; }}>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '1.2rem', fontWeight: 400, color: 'var(--Au)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '.8rem' }}>{card.title}</h2>
              <p style={{ color: 'var(--t2)', fontSize: '.95rem', marginBottom: '.5rem' }}>{card.desc}</p>
              {card.links.map(link => (
                <p key={link.href} style={{ color: 'var(--t2)', fontSize: '.95rem' }}>
                  {link.label}{' '}
                  <a href={link.href} target="_blank" rel="noopener" style={{ color: 'var(--t1)', fontWeight: 600, borderBottom: '1px solid var(--Au)', paddingBottom: 2, textDecoration: 'none' }}>{link.text}</a>
                </p>
              ))}
              {card.note && <p style={{ fontSize: '.85rem', opacity: .7, marginTop: '1rem', color: 'var(--t2)' }}>{card.note}</p>}
            </div>
          ))}
        </div>
      </div>
      <Footer/>
    </>
  );
          }
