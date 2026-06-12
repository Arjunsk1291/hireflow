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
      <div className={cn('flex items-end justify-between mb-10', className)}>
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-1.5 h-1.5 rotate-45 bg-amber-500" style={{ boxShadow: '0 0 10px rgba(245,158,11,0.6)' }} />
            <span className="font-mono text-[10px] text-slate-600 tracking-[0.35em] uppercase">Avenir · HireFlow</span>
          </div>
          <h1 className="font-hero text-4xl sm:text-5xl text-slate-50">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-3 max-w-lg">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </ScrollReveal>
  );
}
