import { Sidebar } from './Sidebar';
import { ShellMain } from './ShellMain';
import { ShellProvider } from './ShellContext';
import type { Session } from 'next-auth';

export function AppShell({ session, children }: { session: Session; children: React.ReactNode }) {
  return (
    <ShellProvider>
      <Sidebar session={session} />
      <ShellMain>{children}</ShellMain>
    </ShellProvider>
  );
}
