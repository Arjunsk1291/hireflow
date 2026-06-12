import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-[#0a1628] border border-white/8 rounded-lg text-sm text-slate-100',
              'placeholder:text-slate-600 transition-all duration-200',
              'focus:outline-none focus:ring-1 focus:ring-amber-500/60 focus:border-amber-500/40',
              'hover:border-white/12',
              icon ? 'pl-10 pr-3 py-2.5' : 'px-3 py-2.5',
              error && 'border-red-500/50 focus:ring-red-500/40',
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
