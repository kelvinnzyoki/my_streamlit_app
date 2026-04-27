import type { Metadata } from 'next';
        
import '../styles/globals.css';  
export const metadata: Metadata = {
  title: 'FlowFit — Transform Your Body at Home',
  description: 'Professional workout tracking, personalized programs, and real-time progress analytics.',
  icons: { icon: '/icons/fit.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@100;200;300;400&family=Lora:ital,wght@0,300;0,400;1,300;1,400&family=JetBrains+Mono:wght@300;400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
