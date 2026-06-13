'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'danger' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

// Skeuomorphic, tactile button styles — real light, depth and press feedback.
const variants = {
  default: 'skeu-btn text-white font-semibold',
  outline:
    'text-violet-200 bg-white/[0.03] border border-white/12 ' +
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:bg-white/[0.07] hover:border-white/20',
  ghost: 'text-slate-300 hover:bg-white/6 hover:text-white',
  danger:
    'text-rose-50 font-medium border border-rose-400/30 ' +
    'bg-gradient-to-b from-rose-500/80 to-rose-600/80 ' +
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_4px_14px_-4px_rgba(244,63,94,0.5)] hover:brightness-110',
  amber:
    'text-violet-200 bg-violet-500/12 border border-violet-400/25 hover:bg-violet-500/20',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-[10px]',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-[15px] rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'md', loading, className, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
        transition={{ type: 'spring', stiffness: 600, damping: 30 }}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 transition-all duration-200 select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0d12]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:saturate-50',
          variants[variant],
          sizes[size],
          className,
        )}
        disabled={disabled || loading}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
      >
        {loading && (
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
