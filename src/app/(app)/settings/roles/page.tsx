import { requireRole } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/layout/PageHeader';
import { ScrollReveal } from '@/components/animation/ScrollReveal';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { parseRoles } from '@/lib/utils';

const ROLE_COLORS: Record<string, 'amber' | 'green' | 'red' | 'default'> = {
  master_admin: 'red',
  hr_manager: 'amber',
  hr_officer: 'amber',
  department_head: 'green',
  finance: 'green',
  recruiter: 'default',
  interviewer: 'default',
};

export default async function RolesPage() {
  await requireRole(['hr_manager', 'master_admin']);

  const profiles = await prisma.profile.findMany({
    orderBy: [{ isActive: 'desc' }, { fullName: 'asc' }],
    select: { id: true, fullName: true, title: true, department: true, email: true, roles: true, isActive: true },
  });

  return (
    <div className="p-8 max-w-3xl">
      <PageHeader title="User Roles" subtitle={`${profiles.length} team members`} />

      <ScrollReveal>
        <div className="glass-card divide-y divide-white/8">
          {profiles.map((profile) => {
            const roles = parseRoles(profile.roles);
            return (
              <div key={profile.id} className="flex items-center gap-4 p-4">
                <Avatar name={profile.fullName} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200 truncate">{profile.fullName}</span>
                    {!profile.isActive && <Badge variant="default">Inactive</Badge>}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">
                    {profile.title}{profile.department ? ` · ${profile.department}` : ''}
                  </div>
                  {profile.email && (
                    <div className="text-xs text-slate-600 font-mono">{profile.email}</div>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 justify-end">
                  {roles.map((role) => (
                    <Badge key={role} variant={ROLE_COLORS[role] ?? 'default'}>
                      {role.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollReveal>
    </div>
  );
}
