import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/authContext';

export const metadata: Metadata = {
  title: 'FlowFit',
  description: 'AI-powered home workouts, analytics, progress tracking, and programs.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
