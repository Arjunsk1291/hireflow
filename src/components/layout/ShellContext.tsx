'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface ShellState {
  collapsed: boolean;          // desktop: icon-rail vs full
  toggleCollapsed: () => void;
  mobileOpen: boolean;         // mobile: drawer open
  openMobile: () => void;
  closeMobile: () => void;
}

const ShellCtx = createContext<ShellState | null>(null);
const STORAGE_KEY = 'hireflow:sidebar-collapsed';

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Restore persisted desktop state on mount
  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === '1') setCollapsed(true);
    } catch { /* ignore */ }
  }, []);

  // Drive the layout width via a CSS variable (desktop sidebar + main margin)
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-w', collapsed ? '76px' : '248px');
  }, [collapsed]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      const next = !c;
      try { localStorage.setItem(STORAGE_KEY, next ? '1' : '0'); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <ShellCtx.Provider value={{ collapsed, toggleCollapsed, mobileOpen, openMobile, closeMobile }}>
      {children}
    </ShellCtx.Provider>
  );
}

export function useShell() {
  const ctx = useContext(ShellCtx);
  if (!ctx) throw new Error('useShell must be used within ShellProvider');
  return ctx;
}
