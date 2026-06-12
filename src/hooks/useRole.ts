'use client';

import { useSession } from 'next-auth/react';

export function useRole() {
  const { data: session } = useSession();
  const userRoles: string[] = ((session?.user as Record<string, unknown>)?.roles as string[]) ?? [];

  const hasRole     = (role: string) => userRoles.includes(role);
  const hasAnyRole  = (roles: string[]) => roles.some((r) => userRoles.includes(r));
  const isHrOrAbove = () => hasRole('master') || hasRole('hr_admin');
  const isMaster    = () => hasRole('master');

  const canApproveStep = (step: string) => {
    const map: Record<string, string[]> = {
      panel_lead:      ['master', 'team_lead', 'team_manager'],
      hr_admin:        ['master', 'hr_admin'],
      svp:             ['master', 'svp'],
      finance_approver:['master', 'finance_approver'],
      master:          ['master'],
    };
    return (map[step] ?? []).some((r) => userRoles.includes(r));
  };

  return { session, userRoles, hasRole, hasAnyRole, isHrOrAbove, isMaster, canApproveStep };
}
