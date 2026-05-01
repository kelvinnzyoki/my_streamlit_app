// src/app/blog/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export const metadata: Metadata = { title: 'Blog' };

const posts = [
  { title: 'How to Break Through a Strength Plateau', excerpt: 'The science-backed strategies that actually work when your progress stalls. Learn how to adjust volume, intensity, and recovery.', date: 'March 28, 2026', readTime: '6 min read' },
  { title: 'Why Progressive Overload Is the Only Thing That Matters', excerpt: 'Forget the fitness fads. Discover how to apply the fundamental law of muscle growth correctly in your home workouts for maximum results.', date: 'March 25, 2026', readTime: '8 min read' },
  { title: 'Best At-Home Exercises for Busy Professionals', excerpt: 'Time-efficient, high-yield workouts that deliver real physiological adaptations even when you only have 20 minutes to spare.', date: 'March 20, 2026', readTime: '5 min read' },
];

export default function BlogPage() {
  return (
    <>
      <Navbar/>
      <div style={{ maxWidth: 1100, margin: '130px auto 5rem', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontFamily: 'var(--f-display)', fontSize: '3rem', fontWeight: 300, color: 'var(--t1)', marginBottom: '1rem', letterSpacing: '-.02em' }}>FlowFit Blog</h1>
          <p style={{ color: 'var(--t2)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' }}>Expert training tips, workout science, nutrition advice, and real success stories from the community.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {posts.map(post => (
            <div key={post.title} style={{ background: 'var(--g-card)', border: '1px solid var(--b1)', borderRadius: 16, padding: '2.5rem 2rem', transition: 'transform .3s ease, border-color .3s ease', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-6px)'; el.style.borderColor = 'var(--Au)'; el.style.boxShadow = '0 10px 30px rgba(0,0,0,0.4)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = ''; el.style.borderColor = 'var(--b1)'; el.style.boxShadow = ''; }}>
              <h3 style={{ fontFamily: 'var(--f-display)', fontSize: '1.4rem', fontWeight: 400, color: 'var(--Au)', lineHeight: 1.4, marginBottom: '1rem' }}>{post.title}</h3>
              <p style={{ color: 'var(--t2)', fontSize: '.95rem', lineHeight: 1.7, marginBottom: '2rem', flexGrow: 1 }}>{post.excerpt}</p>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.75rem', color: 'var(--t3)', borderTop: '1px solid var(--b3)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>{post.date}</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer/>
    </>
  );
      }
