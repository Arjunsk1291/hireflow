import { requireAuth } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/layout/PageHeader';
import { ScrollReveal } from '@/components/animation/ScrollReveal';
import { StaggerList } from '@/components/animation/StaggerList';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Calendar, Video, Users, MapPin } from 'lucide-react';

const MODE_LABEL: Record<string, string> = {
  teams: 'Teams',
  in_person: 'In Person',
  phone: 'Phone',
};

export default async function InterviewsPage() {
  await requireAuth();

  const interviews = await prisma.interview.findMany({
    include: {
      candidate: { select: { id: true, fullName: true, appliedRoleTitle: true } },
      panel: { include: { panelist: true } },
      feedback: { select: { id: true, panelistId: true, recommendation: true } },
    },
    orderBy: { scheduledAt: 'asc' },
  });

  const upcoming = interviews.filter((i) => i.status === 'scheduled');
  const completed = interviews.filter((i) => i.status === 'completed');
  const cancelled = interviews.filter((i) => i.status === 'cancelled');

  const groups = [
    { title: 'UPCOMING', color: 'text-amber-400', interviews: upcoming },
    { title: 'COMPLETED', color: 'text-green-400', interviews: completed },
    { title: 'CANCELLED', color: 'text-slate-500', interviews: cancelled },
  ];

  return (
    <div className="p-8">
      <PageHeader title="Interviews" subtitle={`${interviews.length} total · ${upcoming.length} upcoming`} />

      <div className="space-y-10">
        {groups.map(({ title, color, interviews: group }) => (
          group.length > 0 && (
            <ScrollReveal key={title}>
              <h2 className={`font-display text-xs mb-4 ${color}`}>{title} ({group.length})</h2>
              <StaggerList className="space-y-3">
                {group.map((interview) => (
                  <Link key={interview.id} href={`/candidates/${interview.candidate.id}`}>
                    <div className="glass-card p-4 hover:border-amber-500/30 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <Avatar name={interview.candidate.fullName} size="sm" />
                          <div>
                            <div className="font-medium text-slate-200 text-sm">{interview.candidate.fullName}</div>
                            <div className="text-xs text-amber-400">{interview.candidate.appliedRoleTitle}</div>
                            <div className="text-xs text-slate-500 mt-1">
                              {interview.roundName ?? `Round ${interview.roundNumber}`}
                            </div>
                          </div>
                        </div>

                        <div className="text-right space-y-1.5">
                          <Badge variant={interview.status === 'completed' ? 'green' : interview.status === 'scheduled' ? 'amber' : 'default'}>
                            {interview.status}
                          </Badge>
                          {interview.scheduledAt && (
                            <div className="flex items-center gap-1 text-xs text-slate-400 justify-end">
                              <Calendar size={11} />
                              {formatDate(interview.scheduledAt, 'MMM d, HH:mm')}
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-xs text-slate-500 justify-end">
                            {interview.mode === 'teams' ? <Video size={11} /> : <MapPin size={11} />}
                            {MODE_LABEL[interview.mode ?? 'teams'] ?? interview.mode}
                            {interview.durationMins && ` · ${interview.durationMins}m`}
                          </div>
                        </div>
                      </div>

                      {interview.panel.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/8">
                          <Users size={11} className="text-slate-600" />
                          <div className="flex flex-wrap gap-1">
                            {interview.panel.map((p) => (
                              <span key={p.id} className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded text-slate-400">
                                {p.panelist.fullName}{p.isLead ? ' ★' : ''}
                              </span>
                            ))}
                          </div>
                          {interview.feedback.length > 0 && (
                            <span className="ml-auto text-xs text-green-400">
                              {interview.feedback.length}/{interview.panel.length} feedback
                            </span>
                          )}
                        </div>
                      )}

                      {interview.meetingLink && (
                        <a
                          href={interview.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="mt-2 block text-xs text-blue-400 hover:text-blue-300"
                        >
                          Join Teams Meeting →
                        </a>
                      )}
                    </div>
                  </Link>
                ))}
              </StaggerList>
            </ScrollReveal>
          )
        ))}

        {interviews.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <Calendar size={40} className="mx-auto mb-3 opacity-30" />
            <p>No interviews scheduled yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
