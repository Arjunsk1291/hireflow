import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const session = await auth();
  if (!session) redirect('/auth');
  return session;
}

export async function requireRole(roles: string[]) {
  const session = await requireAuth();
  const userRoles: string[] = ((session.user as Record<string, unknown>).roles as string[]) ?? [];
  const hasRole = roles.some((r) => userRoles.includes(r));
  if (!hasRole) redirect('/dashboard');
  return session;
}

export function hasRole(userRoles: string[], check: string | string[]): boolean {
  const checks = Array.isArray(check) ? check : [check];
  return checks.some((r) => userRoles.includes(r));
}
