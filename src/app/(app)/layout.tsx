import { requireAuth } from '@/lib/auth/guards';
import { AppShell } from '@/components/layout/AppShell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  return <AppShell session={session}>{children}</AppShell>;
}
