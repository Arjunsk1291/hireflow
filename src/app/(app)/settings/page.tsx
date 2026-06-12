import { requireRole } from '@/lib/auth/guards';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { ScrollReveal } from '@/components/animation/ScrollReveal';
import { Mail, Users, DollarSign, Shield, ChevronRight } from 'lucide-react';

const SETTINGS_LINKS = [
  { href: '/settings/email', icon: Mail, label: 'Email Configuration', desc: 'Configure Microsoft Graph API and shared mailbox settings' },
  { href: '/settings/salary-bands', icon: DollarSign, label: 'Salary Bands', desc: 'Manage salary bands by grade and import from Excel' },
  { href: '/settings/roles', icon: Users, label: 'User Roles', desc: 'View and manage HR team profiles and access roles' },
  { href: '/audit', icon: Shield, label: 'Audit Log', desc: 'Review all system activity and access events' },
];

export default async function SettingsPage() {
  await requireRole(['hr_manager', 'master_admin']);

  return (
    <div className="p-8 max-w-2xl">
      <PageHeader title="Settings" subtitle="System configuration and administration" />

      <ScrollReveal>
        <div className="glass-card divide-y divide-white/8">
          {SETTINGS_LINKS.map(({ href, icon: Icon, label, desc }) => (
            <Link key={href} href={href} className="flex items-center gap-4 p-4 hover:bg-white/3 transition-colors group">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 transition-colors">
                <Icon size={16} className="text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
              </div>
              <ChevronRight size={14} className="text-slate-600 group-hover:text-amber-400 transition-colors" />
            </Link>
          ))}
        </div>
      </ScrollReveal>
    </div>
  );
}
