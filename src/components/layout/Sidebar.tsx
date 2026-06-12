'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard, Users, Calendar, CheckSquare,
  BarChart3, FileText, Settings, LogOut, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import type { Session } from 'next-auth';

const navItems = [
  { href: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/candidates',  label: 'Candidates',  icon: Users },
  { href: '/interviews',  label: 'Interviews',  icon: Calendar },
  { href: '/approvals',   label: 'Approvals',   icon: CheckSquare },
  { href: '/reports',     label: 'Reports',     icon: BarChart3 },
  { href: '/audit',       label: 'Audit Log',   icon: FileText },
  { href: '/settings',    label: 'Settings',    icon: Settings },
];

export function Sidebar({ session }: { session: Session }) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-60 flex flex-col z-40 border-r border-white/5"
      style={{ background: 'rgba(5, 11, 20, 0.95)', backdropFilter: 'blur(20px)' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
          <Zap size={16} className="text-amber-400" />
        </div>
        <div>
          <div className="font-display text-sm text-amber-400">HIREFLOW</div>
          <div className="text-[10px] text-slate-600">Avenir Int'l</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/') && href !== '/';

          return (
            <motion.div key={href} whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
              <Link
                href={href}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                  isActive
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/4',
                )}
              >
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute left-0 top-1 bottom-1 w-0.5 bg-amber-500 rounded-full"
                      style={{ boxShadow: '0 0 12px #f59e0b' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    />
                  )}
                </AnimatePresence>
                <Icon size={16} />
                {label}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar name={session.user.name ?? 'User'} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-200 truncate">{session.user.name}</div>
            <div className="text-[10px] text-slate-600 truncate">
              {((session.user as Record<string, unknown>).roles as string[])?.[0]?.replace(/_/g, ' ') ?? 'User'}
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/auth' })}
            className="text-slate-600 hover:text-slate-400 transition-colors"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
