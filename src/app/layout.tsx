import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/authContext';

export const metadata: Metadata = {
  title: 'FlowFit — AI Home Fitness',
  description: 'AI-powered home workouts, analytics, progress tracking, and programs.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=localStorage.getItem('flowfit-theme');if(s==='light'){document.documentElement.classList.add('light-mode');document.documentElement.dataset.theme='light';}else{document.documentElement.dataset.theme='dark';}})();`,
          }}
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
