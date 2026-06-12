import { requireAuth } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/layout/PageHeader';
import { ScrollReveal } from '@/components/animation/ScrollReveal';
import { Avatar } from '@/components/ui/avatar';
import { formatDateTime, timeAgo } from '@/lib/utils';
import { Shield } from 'lucide-react';

export default async function AuditPage() {
  await requireAuth();

  const events = await prisma.auditEvent.findMany({
    include: { actor: true, candidate: { select: { fullName: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const ACTION_COLORS: Record<string, string> = {
    create: 'text-green-400 bg-green-500/10 border-green-500/20',
    update: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    delete: 'text-red-400 bg-red-500/10 border-red-500/20',
    login: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    approve: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    reject: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    send: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    submit: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  };

  return (
    <div className="p-8 max-w-4xl">
      <PageHeader title="Audit Log" subtitle={`${events.length} recent events`} />

      <ScrollReveal>
        <div className="glass-card divide-y divide-white/8">
          {events.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <Shield size={40} className="mx-auto mb-3 opacity-30" />
              <p>No audit events recorded yet.</p>
            </div>
          ) : (
            events.map((event) => {
              const colorClass = ACTION_COLORS[event.action] ?? 'text-slate-400 bg-white/5 border-white/10';
              let parsedMeta: Record<string, unknown> = {};
              try { parsedMeta = event.metadata ? JSON.parse(event.metadata as string) : {}; } catch {}

              return (
                <div key={event.id} className="flex items-start gap-4 p-4 hover:bg-white/2 transition-colors">
                  {event.actor ? (
                    <Avatar name={event.actor.fullName} size="sm" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Shield size={12} className="text-slate-600" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-slate-200 font-medium">
                        {event.actor?.fullName ?? event.actorEmail ?? 'System'}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${colorClass}`}>
                        {event.action.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-400">{event.entityType}</span>
                      {event.candidate && (
                        <span className="text-xs text-amber-400/70">→ {event.candidate.fullName}</span>
                      )}
                    </div>

                    {parsedMeta.message != null && (
                      <p className="text-xs text-slate-500 mt-1">{String(parsedMeta.message)}</p>
                    )}

                    {event.entityId && (
                      <p className="text-[10px] text-slate-600 mt-1 font-mono">ID: {event.entityId}</p>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-slate-500">{timeAgo(event.createdAt)}</div>
                    <div className="text-[10px] text-slate-700 mt-0.5">{formatDateTime(event.createdAt)}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollReveal>
    </div>
  );
}
