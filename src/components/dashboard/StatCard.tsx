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

export function StatCard({ title, value, icon: Icon, color = '#f59e0b', prefix, suffix, trend, className }: StatCardProps) {
  return (
    <motion.div
      className={cn('glass-card p-5', className)}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{title}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <CountUp
              value={value}
              prefix={prefix}
              suffix={suffix}
              className="text-3xl font-bold text-slate-100 font-mono"
            />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-1.5 text-xs ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              <span>{trend >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend)}% this week</span>
            </div>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15`, border: `1px solid ${color}25` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
}
