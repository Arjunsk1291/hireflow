import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'w-full appearance-none bg-[#15161d] border border-white/8 rounded-lg px-3 py-2.5 pr-10',
              'text-sm text-slate-100 transition-all duration-200',
              'focus:outline-none focus:ring-1 focus:ring-violet-500/60 focus:border-violet-500/40',
              'hover:border-white/12',
              error && 'border-red-500/50',
              className,
            )}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#15161d]">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
