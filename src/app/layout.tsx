import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/authContext';
import { ToastProvider } from '@/components/ToastProvider';

export const metadata: Metadata = {
  title: 'FlowFit',
  description: 'AI home fitness platform with protected workout analytics.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
