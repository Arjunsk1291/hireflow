import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import type { Session } from 'next-auth';

export function AppShell({ session, children }: { session: Session; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050b14]">
      <Sidebar session={session} />
      <TopBar />
      <main className="ml-60 pt-16 min-h-screen">
        <div className="blueprint-grid min-h-[calc(100vh-64px)]">
          {children}
        </div>
      </main>
    </div>
  );
}
