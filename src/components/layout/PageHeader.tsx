import { ScrollReveal } from '@/components/animation/ScrollReveal';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <ScrollReveal>
      <div className={cn('flex flex-wrap items-end justify-between gap-4 mb-9', className)}>
        <div className="min-w-0">
          <h1 className="font-display text-[28px] sm:text-[34px] leading-tight text-slate-50">{title}</h1>
          {subtitle && <p className="text-sm text-slate-400 mt-2 max-w-xl">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </ScrollReveal>
  );
}
