'use client';

import { useScroll, useSpring, motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Menu } from 'lucide-react';
import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useShell } from './ShellContext';
import Link from 'next/link';
import { timeAgo } from '@/lib/utils';

export function TopBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const { notifications, unread, markAllRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const { openMobile } = useShell();

  return (
    <>
      {/* Scroll progress */}
      <motion.div
        style={{ scaleX, transformOrigin: '0% 50%' }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-violet-400 z-50"
      />

      <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 sm:px-6 glass-panel border-b border-white/6">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Mobile hamburger */}
          <button
            onClick={openMobile}
            className="lg:hidden p-2 -ml-1 rounded-lg text-slate-300 hover:bg-white/6 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="relative max-w-sm w-full hidden sm:block">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              placeholder="Search candidates, roles…"
              className="w-full skeu-inset pl-10 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) markAllRead(); }}
              className="relative p-2.5 rounded-xl hover:bg-white/6 transition-colors text-slate-400 hover:text-slate-100"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unread > 0 && (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-violet-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                  style={{ boxShadow: '0 0 0 2px var(--bg-base)' }}
                >
                  {unread > 9 ? '9+' : unread}
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-full mt-2 w-80 glass-card !rounded-2xl overflow-hidden shadow-2xl"
                >
                  <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-100">Notifications</span>
                    <button onClick={markAllRead} className="text-xs text-violet-300 hover:text-violet-200">Mark all read</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-10 text-center text-sm text-slate-500">You&apos;re all caught up ✓</div>
                    ) : (
                      notifications.slice(0, 10).map((n) => {
                        const inner = (
                          <>
                            <div className="text-xs font-medium text-slate-100">{n.title}</div>
                            {n.body && <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{n.body}</div>}
                            <div className="text-[10px] text-slate-600 mt-1">{timeAgo(n.createdAt)}</div>
                          </>
                        );
                        return (
                          <div key={n.id} className={`px-4 py-3 border-b border-white/5 hover:bg-white/4 transition-colors ${!n.isRead ? 'bg-violet-500/6' : ''}`}>
                            {n.link ? (
                              <Link href={n.link} onClick={() => setShowNotifications(false)} className="block">{inner}</Link>
                            ) : inner}
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>
    </>
  );
}
