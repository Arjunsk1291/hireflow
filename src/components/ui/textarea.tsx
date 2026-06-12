import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full bg-[#0a1628] border border-white/8 rounded-lg px-3 py-2.5',
            'text-sm text-slate-100 placeholder:text-slate-600',
            'focus:outline-none focus:ring-1 focus:ring-amber-500/60 focus:border-amber-500/40',
            'hover:border-white/12 transition-all duration-200 resize-none',
            error && 'border-red-500/50',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
