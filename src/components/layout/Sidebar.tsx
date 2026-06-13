'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard, Users, Calendar, CheckSquare,
  BarChart3, FileText, Settings, LogOut, PanelLeftClose, PanelLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { useShell } from './ShellContext';
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
  const { collapsed, toggleCollapsed, mobileOpen, closeMobile } = useShell();

  const role = ((session.user as Record<string, unknown>).roles as string[])?.[0]?.replace(/_/g, ' ') ?? 'User';

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeMobile}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'app-sidebar glass-panel fixed top-0 left-0 h-full z-50 flex flex-col w-[248px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
        )}
        style={{ borderRight: '1px solid var(--glass-stroke)' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 h-16 px-4 border-b border-white/6 shrink-0">
          <div className="w-9 h-9 rounded-xl shrink-0 grid place-items-center skeu-btn">
            <span className="font-display text-white text-base">H</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden lg:block">
              <div className="font-display text-[15px] text-slate-50 leading-tight">HireFlow</div>
              <div className="text-[10px] text-slate-500 truncate">Avenir Int&apos;l Engineers</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (pathname.startsWith(href + '/') && href !== '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={closeMobile}
                className={cn(
                  'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors duration-200',
                  collapsed && 'lg:justify-center lg:px-0',
                  isActive
                    ? 'text-white bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]',
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-violet-400"
                    style={{ boxShadow: '0 0 12px var(--accent-glow)' }}
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="lg:block truncate">{label}</span>}

                {/* Tooltip when collapsed (desktop) */}
                {collapsed && (
                  <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-lg glass-panel text-xs text-slate-100 whitespace-nowrap opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 hidden lg:block z-50">
                    {label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={toggleCollapsed}
          className="hidden lg:flex items-center gap-3 mx-3 mb-2 px-3 py-2.5 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/[0.04] transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          {!collapsed && <span className="text-sm">Collapse</span>}
        </button>

        {/* User */}
        <div className="px-3 py-3 border-t border-white/6 shrink-0">
          <div className={cn('flex items-center gap-3 px-1.5 py-1.5', collapsed && 'lg:justify-center lg:px-0')}>
            <Avatar name={session.user.name ?? 'User'} size="sm" />
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0 lg:block">
                  <div className="text-xs font-medium text-slate-100 truncate">{session.user.name}</div>
                  <div className="text-[10px] text-slate-500 truncate capitalize">{role}</div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/auth' })}
                  className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                  title="Sign out"
                >
                  <LogOut size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
