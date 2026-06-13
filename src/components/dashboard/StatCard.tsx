'use client';

import { motion } from 'framer-motion';
import { CountUp } from '@/components/animation/CountUp';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color?: string;
  prefix?: string;
  suffix?: string;
  trend?: number;
  className?: string;
}

export function StatCard({ title, value, icon: Icon, color = '#6e63f0', prefix, suffix, trend, className }: StatCardProps) {
  return (
    <motion.div
      className={cn('glass-card p-5 group', className)}
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 380, damping: 24 }}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs text-slate-400 font-medium">{title}</p>
          <div className="mt-2.5 flex items-baseline gap-1">
            <CountUp
              value={value}
              prefix={prefix}
              suffix={suffix}
              className="text-[34px] leading-none font-bold text-slate-50 font-mono tracking-tight"
            />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2.5 text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              <span>{trend >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend)}% this week</span>
            </div>
          )}
        </div>
        {/* Skeuomorphic icon chip: raised, glossy, soft colored glow */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
          style={{
            background: `linear-gradient(180deg, ${color}2e 0%, ${color}14 100%)`,
            border: `1px solid ${color}33`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.12), 0 6px 16px -6px ${color}66`,
          }}
        >
          <Icon size={20} style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
}
