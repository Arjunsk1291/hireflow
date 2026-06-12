import { cn } from '@/lib/utils';
import { STATUS_META } from '@/lib/constants';

interface BadgeProps {
  status?: string;
  variant?: 'default' | 'amber' | 'green' | 'red' | 'blue' | 'purple';
  children?: React.ReactNode;
  className?: string;
}

const variantStyles = {
  default: { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)',  border: 'rgba(148,163,184,0.25)' },
  amber:   { color: '#fbbf24', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.25)' },
  green:   { color: '#4ade80', bg: 'rgba(34,197,94,0.1)',    border: 'rgba(34,197,94,0.25)' },
  red:     { color: '#f87171', bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.25)' },
  blue:    { color: '#60a5fa', bg: 'rgba(59,130,246,0.1)',   border: 'rgba(59,130,246,0.25)' },
  purple:  { color: '#c084fc', bg: 'rgba(168,85,247,0.1)',   border: 'rgba(168,85,247,0.25)' },
};

export function Badge({ status, variant = 'default', children, className }: BadgeProps) {
  const meta = status ? STATUS_META[status] : null;
  const style = meta ?? variantStyles[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        className,
      )}
      style={{ color: style.color, backgroundColor: style.bg, borderColor: style.border }}
    >
      {status && meta ? meta.label : children}
    </span>
  );
}
