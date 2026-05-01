// src/components/footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      padding: '6rem var(--pad-x) 2.5rem',
      position: 'relative', zIndex: 2,
      borderTop: '1px solid var(--b1)',
      background: 'var(--ink)',
    }}>
      <div style={{
        maxWidth: 'var(--col-max)', margin: '0 auto',
        display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1fr', gap: '3rem',
        marginBottom: '4rem',
      }}>
        <div>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '.6rem', textDecoration: 'none' }}>
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <defs>
                <linearGradient id="footerGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#EDD87A"/><stop offset="55%" stopColor="#C9A84C"/><stop offset="100%" stopColor="#8E6E28"/>
                </linearGradient>
              </defs>
              <circle cx="20" cy="20" r="18" fill="#0f0e18"/>
              <circle cx="20" cy="20" r="16" stroke="url(#footerGrad)" strokeWidth="1.8" fill="none" strokeDasharray="72 29" strokeDashoffset="18" strokeLinecap="round"/>
              <path d="M4,20 L11,20 L14,12 L18,28 L22,16 L25,20 L36,20" stroke="url(#footerGrad)" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.02rem', lineHeight: 1 }}>
              <span style={{ fontFamily: 'var(--f-display)', fontWeight: 200, fontSize: '.9rem', letterSpacing: '.42em', textTransform: 'uppercase', color: 'var(--Au-hi)' }}>Flow</span>
              <span style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: '.6rem', letterSpacing: '.5em', textTransform: 'uppercase', color: 'var(--Au)', opacity: .85 }}>Fit</span>
            </div>
          </Link>
          <p style={{ color: 'var(--t2)', marginTop: '1.4rem', fontFamily: 'var(--f-display)', fontSize: '.82rem', fontWeight: 300, lineHeight: 1.9, maxWidth: 290, letterSpacing: '.02em' }}>
            Transform your body at home with professional workout tracking, personalized programs, and real-time progress analytics.
          </p>
        </div>

        {[
          { title: 'Product', links: [['/#features','Features'],['/#pricing','Pricing'],['/dashboard','Dashboard'],['/programs','Programs']] },
          { title: 'Company', links: [['/about','About Us'],['/blog','Blog'],['/contact','Contact']] },
          { title: 'Legal', links: [['/legal/privacy','Privacy Policy'],['/legal/terms','Terms of Service'],['/legal/cookies','Cookie Policy']] },
        ].map(({ title, links }) => (
          <div key={title}>
            <h4 style={{ fontFamily: 'var(--f-display)', fontSize: '.64rem', fontWeight: 300, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--Au)', marginBottom: '1.5rem' }}>{title}</h4>
            <ul style={{ listStyle: 'none' }}>
              {links.map(([href, label]) => (
                <li key={href} style={{ marginBottom: '.75rem' }}>
                  <Link href={href} style={{ color: 'var(--t2)', textDecoration: 'none', fontFamily: 'var(--f-display)', fontSize: '.82rem', fontWeight: 300, letterSpacing: '.03em', transition: 'color .25s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--Au-hi)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--t2)')}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{
        maxWidth: 'var(--col-max)', margin: '0 auto',
        paddingTop: '2rem', borderTop: '1px solid var(--b3)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        color: 'var(--t3)', fontFamily: 'var(--f-display)', fontSize: '.74rem', fontWeight: 300, letterSpacing: '.04em',
      }}>
        <p>© 2026 FlowFit. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '1.6rem' }}>
          {[['/legal/privacy','Privacy'],['/legal/terms','Terms'],['/legal/cookies','Cookies']].map(([href, label]) => (
            <Link key={href} href={href} style={{ color: 'var(--t3)', textDecoration: 'none', fontFamily: 'var(--f-display)', fontSize: '.72rem', fontWeight: 200, transition: 'color .25s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--Au-hi)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--t3)')}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
