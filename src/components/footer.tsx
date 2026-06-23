import Link from 'next/link';

const protectedRedirect = (path: string) => `/auth/login?redirect=${encodeURIComponent(path)}`;

const footerGroups = [
  {
    title: 'Platform',
    links: [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact / Support', href: '/contact' },
    ],
  },
  {
    title: 'Train',
    links: [
      { label: 'Workouts', href: protectedRedirect('/workouts') },
      { label: 'Programs', href: protectedRedirect('/programs') },
      { label: 'Progress', href: protectedRedirect('/progress') },
      { label: 'AI Coach', href: protectedRedirect('/coach') },
      { label: 'Generate Plan', href: protectedRedirect('/generate-plan') },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Dashboard', href: protectedRedirect('/dashboard') },
      { label: 'Profile', href: protectedRedirect('/profile') },
      { label: 'Login', href: '/auth/login' },
      { label: 'Create Account', href: '/auth/register' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: '/legal/terms' },
      { label: 'Privacy Policy', href: '/legal/privacy' },
      { label: 'Cookie Policy', href: '/legal/cookies' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="ff-footer ff-footer-premium">
      <div className="ff-footer-glow" aria-hidden="true" />

      <div className="ff-footer-inner ff-footer-premium-inner">
        <div className="ff-footer-brand ff-footer-premium-brand">
          <Link href="/" className="ff-footer-logo-wrap" aria-label="FlowFit Home">
            <span className="ff-footer-mark" aria-hidden="true">FF</span>
            <span className="ff-footer-logo">FlowFit</span>
          </Link>

          <p className="ff-footer-tagline">
            Home workouts, AI coaching, progress tracking, and structured programs built for real consistency.
          </p>

          <div className="ff-footer-badges" aria-label="FlowFit highlights">
            <span>No equipment</span>
            <span>AI coach</span>
            <span>Progress analytics</span>
          </div>
        </div>

        <nav className="ff-footer-links ff-footer-premium-links" aria-label="Footer navigation">
          {footerGroups.map((group) => (
            <div className="ff-footer-col" key={group.title}>
              <span className="ff-footer-col-title">{group.title}</span>
              {group.links.map((link) => (
                <Link key={`${group.title}-${link.label}`} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>

      <div className="ff-footer-bottom">
        <p className="ff-footer-copy">© {new Date().getFullYear()} FlowFit. All rights reserved.</p>
        <p className="ff-footer-note">Protected pages open after login.</p>
      </div>
    </footer>
  );
}
