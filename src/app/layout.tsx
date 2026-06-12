import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { QueryProvider } from '@/lib/query-provider';
import { LenisProvider } from '@/components/animation/setup';
import { PageTransition } from '@/components/animation/PageTransition';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'HireFlow — Avenir International Engineers',
  description: 'Internal hiring management platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="lenis">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Syne:wght@600;700;800&family=Oswald:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SessionProvider>
          <QueryProvider>
            <LenisProvider>
              <PageTransition>
                {children}
              </PageTransition>
              <Toaster
                richColors
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: 'rgba(16, 30, 51, 0.95)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    color: '#f8fafc',
                    borderRadius: '10px',
                  },
                  duration: 4000,
                }}
              />
            </LenisProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
