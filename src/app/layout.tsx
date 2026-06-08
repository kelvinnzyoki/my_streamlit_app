import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/authContext';

export const metadata: Metadata = { title: 'FlowFit', description: 'Home workouts powered by AI, analytics, and progress tracking.' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" data-theme="dark" suppressHydrationWarning><body><AuthProvider>{children}</AuthProvider></body></html>;
}
