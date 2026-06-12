'use client';

import { motion } from 'framer-motion';
import { DrawLine } from '@/components/animation/DrawLine';
import { formatDateTime } from '@/lib/utils';
import { STATUS_META } from '@/lib/constants';
import type { AuditEvent } from '@/types';

const ACTION_ICONS: Record<string, string> = {
  candidate_created:          '📥',
  status_changed:             '🔄',
  cv_review_assigned:         '👁️',
  cv_review_submitted:        '✅',
  interview_scheduled:        '📅',
  feedback_submitted:         '📝',
  offer_created:              '📋',
  offer_submitted_for_approval: '⏳',
  offer_approved:             '✅',
  offer_rejected:             '❌',
  offer_sent:                 '📨',
  offer_pdf_generated:        '📄',
};

export function CandidateTimeline({ events }: { events: AuditEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-slate-600 text-sm">No activity yet.</div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-5 top-4 bottom-4 flex justify-center" style={{ width: 2 }}>
        <DrawLine orientation="vertical" length="100%" color="#f59e0b" thickness={2} />
      </div>

      <div className="space-y-4 pl-12">
        {events.map((event, index) => {
          let newData: Record<string, unknown> = {};
          try { newData = event.newData ? JSON.parse(event.newData as string) : {}; } catch {}

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: index * 0.07 }}
              className="glass-card p-4 relative"
            >
              {/* Dot */}
              <div className="absolute -left-8 top-5 w-3 h-3 rounded-full bg-amber-500 border-2 border-[#050b14]"
                style={{ boxShadow: '0 0 8px rgba(245,158,11,0.6)' }} />

              <div className="flex items-start gap-3">
                <span className="text-lg shrink-0">{ACTION_ICONS[event.action] ?? '📌'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-200 capitalize">
                      {event.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-slate-600 shrink-0">{formatDateTime(event.createdAt)}</span>
                  </div>
                  {event.actorEmail && (
                    <div className="text-xs text-slate-500 mt-0.5">by {event.actorEmail}</div>
                  )}
                  {newData.status != null && (
                    <div className="mt-1 text-xs">
                      <span className="text-slate-500">→ </span>
                      <span style={{ color: STATUS_META[String(newData.status)]?.color ?? '#94a3b8' }}>
                        {STATUS_META[String(newData.status)]?.label ?? String(newData.status)}
                      </span>
                    </div>
                  )}
                  {newData.decision != null && (
                    <div className="mt-1 text-xs text-slate-400">Decision: {String(newData.decision)}</div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
