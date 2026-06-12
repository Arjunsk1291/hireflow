'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  animate?: boolean;
}

export function Card({ children, className, hover = true, animate = true }: CardProps) {
  if (animate) {
    return (
      <motion.div
        className={cn('glass-card p-5', className)}
        whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
        whileTap={hover ? { scale: 0.99 } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cn('glass-card p-5', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-base font-semibold text-slate-100', className)}>{children}</h3>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
