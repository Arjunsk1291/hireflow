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
      <div className={cn('flex items-start justify-between mb-8', className)}>
        <div>
          <h1 className="font-display text-2xl text-slate-100">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </ScrollReveal>
  );
}
