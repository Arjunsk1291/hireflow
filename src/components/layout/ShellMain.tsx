'use client';

import { TopBar } from './TopBar';

export function ShellMain({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-main min-h-screen">
      <TopBar />
      <main className="min-h-[calc(100vh-64px)]">
        {children}
      </main>
    </div>
  );
}
