import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
      <div className="footer-content">
        <div className="footer-brand">
          <Link href="/" className="logo-wrap" aria-label="FlowFit" style={{ borderLeft: 'none', paddingLeft: 0, height: 'auto', marginBottom: '1rem' }}>
            <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="pB" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#EDD87A" /><stop offset="55%" stopColor="#C9A84C" /><stop offset="100%" stopColor="#8E6E28" />
                </linearGradient>
              </defs>
              <circle cx="20" cy="20" r="18" fill="#0f0e18" />
              <circle cx="20" cy="20" r="16" stroke="url(#pB)" strokeWidth="1.8" fill="none" strokeDasharray="72 29" strokeDashoffset="18" strokeLinecap="round" />
              <path d="M4,20 L11,20 L14,12 L18,28 L22,16 L25,20 L36,20" stroke="url(#pB)" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="logo-wordmark">
              <span className="logo-flow">FLOW</span>
              <span className="logo-fit">FIT</span>
            </div>
          </Link>
          <p>Transform your body at home with professional workout tracking, personalized programs, and real-time progress analytics.</p>
        </div>

        <div className="footer-links">
          <h4>Product</h4>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><Link href="/dashboard">Dashboard</Link></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Company</h4>
          <ul>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Legal</h4>
          <ul>
            <li><Link href="/legal/privacy">Privacy Policy</Link></li>
            <li><Link href="/legal/terms">Terms of Service</Link></li>
            <li><Link href="/legal/cookies">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} FlowFit. All rights reserved.</span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/terms">Terms</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
