import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/authContext';

export const metadata: Metadata = {
  title: 'FlowFit — Home Workouts Powered by AI',
  description: 'Premium home workout platform with AI coaching, analytics, progress tracking, and no-equipment programs.',
  icons: { icon: '/icons/fit.svg' }
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
