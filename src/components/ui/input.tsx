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
          <label className="block text-xs font-medium text-slate-400">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              // recessed "well": inset shadow gives a tactile, carved-in feel
              'w-full skeu-inset text-sm text-slate-100',
              'placeholder:text-slate-600 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400/30',
              icon ? 'pl-10 pr-3.5 py-2.5' : 'px-3.5 py-2.5',
              error && 'ring-2 ring-rose-500/40',
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-rose-400">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
