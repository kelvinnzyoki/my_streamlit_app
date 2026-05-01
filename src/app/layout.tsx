// src/app/layout.tsx
import type { Metadata } from 'next';
import '@/styles/globals.css';
import { AuthProvider } from '@/context/authContext';

export const metadata: Metadata = {
  title: { default: 'FlowFit — Transform Your Body at Home', template: '%s — FlowFit' },
  description: 'Professional workout tracking, personalized programs, and real-time progress analytics. Your fitness journey starts here.',
  keywords: ['fitness', 'workout', 'home workout', 'progress tracking', 'exercise'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
