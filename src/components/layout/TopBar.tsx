'use client';

import { useScroll, useSpring, motion } from 'framer-motion';
import { Bell, Search } from 'lucide-react';
import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import Link from 'next/link';
import { timeAgo } from '@/lib/utils';

export function TopBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const { notifications, unread, markAllRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      {/* Scroll progress bar */}
      <motion.div
        style={{ scaleX, transformOrigin: '0% 50%' }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-amber-500 z-50"
      />

      <header className="fixed top-0 right-0 left-60 h-16 z-30 border-b border-white/5 flex items-center justify-between px-6"
        style={{ background: 'rgba(5, 11, 20, 0.95)', backdropFilter: 'blur(20px)' }}>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              placeholder="Search candidates..."
              className="bg-white/4 border border-white/6 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-400 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/30 w-56 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) markAllRead(); }}
              className="relative p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-500 hover:text-slate-300"
            >
              <Bell size={18} />
              {unread > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 w-4 h-4 bg-amber-500 rounded-full text-[9px] font-bold text-black flex items-center justify-center"
                >
                  {unread > 9 ? '9+' : unread}
                </motion.span>
              )}
            </button>

            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 top-12 w-80 glass-card shadow-2xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-200">Notifications</span>
                  <button onClick={markAllRead} className="text-xs text-amber-400 hover:text-amber-300">
                    Mark all read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-slate-600">No notifications</div>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 border-b border-white/5 hover:bg-white/4 transition-colors ${!n.isRead ? 'bg-amber-500/5' : ''}`}
                      >
                        {n.link ? (
                          <Link href={n.link} onClick={() => setShowNotifications(false)} className="block">
                            <div className="text-xs font-medium text-slate-200">{n.title}</div>
                            {n.body && <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{n.body}</div>}
                            <div className="text-[10px] text-slate-600 mt-1">{timeAgo(n.createdAt)}</div>
                          </Link>
                        ) : (
                          <>
                            <div className="text-xs font-medium text-slate-200">{n.title}</div>
                            {n.body && <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{n.body}</div>}
                            <div className="text-[10px] text-slate-600 mt-1">{timeAgo(n.createdAt)}</div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
