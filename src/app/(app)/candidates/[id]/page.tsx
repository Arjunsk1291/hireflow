import { requireAuth } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/candidates/StatusBadge';
import { CandidateTimeline } from '@/components/candidates/CandidateTimeline';
import { ApprovalChainStatus } from '@/components/offer/ApprovalChainStatus';
import { ScrollReveal } from '@/components/animation/ScrollReveal';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatDate, formatCurrency, timeAgo, parseTags } from '@/lib/utils';
import { Briefcase, MapPin, Mail, Phone, Link2, Clock, Globe, ExternalLink, Edit } from 'lucide-react';
import type { AuditEvent, OfferApproval, Profile } from '@/types';

export default async function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  const { id } = await params;

  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      assignedHR: true,
      submittedBy: true,
      salaryBand: true,
      cvReviews: { include: { reviewer: true, assignedBy: true } },
      interviews: {
        include: {
          panel: { include: { panelist: true } },
          feedback: { include: { panelist: true } },
        },
      },
      offer: {
        include: {
          approvals: { include: { approver: true }, orderBy: { stepOrder: 'asc' } },
          response: true,
          reportingTo: true,
        },
      },
      auditEvents: { orderBy: { createdAt: 'desc' }, take: 30 },
    },
  });

  if (!candidate) notFound();

  const tags = parseTags(candidate.tags ?? '[]');
  let cvData: Record<string, unknown> | null = null;
  try { cvData = candidate.cvExtractedData ? JSON.parse(candidate.cvExtractedData as string) : null; } catch {}

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div className="flex items-start gap-4">
            <Avatar name={candidate.fullName} size="xl" />
            <div>
              <h1 className="text-2xl font-bold text-slate-100">{candidate.fullName}</h1>
              <p className="text-violet-400 mt-0.5">{candidate.appliedRoleTitle}</p>
              <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                {candidate.currentEmployer && (
                  <span className="flex items-center gap-1"><Briefcase size={13} />{candidate.currentEmployer}</span>
                )}
                {candidate.currentLocation && (
                  <span className="flex items-center gap-1"><MapPin size={13} />{candidate.currentLocation}</span>
                )}
                {candidate.yearsExperience && (
                  <span className="flex items-center gap-1"><Clock size={13} />{candidate.yearsExperience}y exp</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <StatusBadge status={candidate.status} />
                {tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/candidates/${id}/offer`}>
              <Button variant="outline" size="sm">Offer</Button>
            </Link>
            <Link href={`/candidates/${id}/interview`}>
              <Button variant="outline" size="sm">Interview</Button>
            </Link>
            <Link href={`/candidates/${id}/review`}>
              <Button size="sm">Review CV</Button>
            </Link>
          </div>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Contact Info */}
          <ScrollReveal>
            <div className="glass-card p-5">
              <h2 className="font-display text-xs text-violet-400 mb-4">CONTACT</h2>
              <div className="space-y-2">
                {candidate.email && (
                  <a href={`mailto:${candidate.email}`} className="flex items-center gap-2 text-sm text-slate-300 hover:text-violet-400 transition-colors">
                    <Mail size={14} className="text-slate-500" />
                    {candidate.email}
                  </a>
                )}
                {candidate.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Phone size={14} className="text-slate-500" />
                    {candidate.phone}
                  </div>
                )}
                {candidate.linkedinUrl && (
                  <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                    <Link2 size={14} />
                    LinkedIn Profile <ExternalLink size={11} />
                  </a>
                )}
                {candidate.nationality && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Globe size={14} className="text-slate-500" />
                    {candidate.nationality}
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* CV Review Section */}
          {candidate.cvReviews.length > 0 && (
            <ScrollReveal>
              <div className="glass-card p-5">
                <h2 className="font-display text-xs text-violet-400 mb-4">CV REVIEWS</h2>
                <div className="space-y-3">
                  {candidate.cvReviews.map((review) => (
                    <div key={review.id} className="p-3 bg-white/3 rounded-lg border border-white/8">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar name={review.reviewer.fullName} size="sm" />
                          <span className="text-sm font-medium text-slate-200">{review.reviewer.fullName}</span>
                        </div>
                        {review.decision && (
                          <Badge
                            variant={review.decision === 'shortlist' ? 'green' : review.decision === 'reject' ? 'red' : 'default'}
                          >
                            {review.decision}
                          </Badge>
                        )}
                      </div>
                      {review.scoreTechnical != null && (
                        <div className="flex gap-4 text-xs text-slate-500 mb-2">
                          <span>Technical: <span className="text-violet-400">{review.scoreTechnical}/10</span></span>
                          <span>Experience: <span className="text-violet-400">{review.scoreExperience}/10</span></span>
                          <span>Culture: <span className="text-violet-400">{review.scoreCulture}/10</span></span>
                        </div>
                      )}
                      {review.comments && <p className="text-xs text-slate-400">{review.comments}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Interviews */}
          {candidate.interviews.length > 0 && (
            <ScrollReveal>
              <div className="glass-card p-5">
                <h2 className="font-display text-xs text-violet-400 mb-4">INTERVIEWS</h2>
                <div className="space-y-4">
                  {candidate.interviews.map((interview) => (
                    <div key={interview.id} className="p-4 bg-white/3 rounded-lg border border-white/8">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-slate-200">{interview.roundName ?? `Round ${interview.roundNumber}`}</span>
                        <Badge variant={interview.status === 'completed' ? 'green' : interview.status === 'scheduled' ? 'amber' : 'default'}>
                          {interview.status}
                        </Badge>
                      </div>
                      {interview.scheduledAt && (
                        <p className="text-xs text-slate-500 mb-2">{formatDate(interview.scheduledAt, 'MMM d, yyyy HH:mm')}</p>
                      )}
                      {interview.meetingLink && (
                        <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300">
                          Join Teams Meeting →
                        </a>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {interview.panel.map((p) => (
                          <span key={p.id} className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded text-slate-400">
                            {p.panelist.fullName}{p.isLead ? ' (Lead)' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Offer Section */}
          {candidate.offer && (
            <ScrollReveal>
              <div className="glass-card p-5">
                <h2 className="font-display text-xs text-violet-400 mb-4">OFFER</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Offered Salary</span>
                    <span className="text-sm font-medium text-slate-200">
                      {formatCurrency(candidate.offer.offeredSalary ?? 0, candidate.offer.currency)}
                    </span>
                  </div>
                  {candidate.offer.startDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Start Date</span>
                      <span className="text-sm text-slate-200">{formatDate(candidate.offer.startDate)}</span>
                    </div>
                  )}
                  {candidate.offer.approvals.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Approval Chain</p>
                      <ApprovalChainStatus approvals={candidate.offer.approvals as (OfferApproval & { approver?: Profile | null })[]} />
                    </div>
                  )}
                  {candidate.offer.response && (
                    <div className="p-3 bg-white/3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant={candidate.offer.response.action === 'accept' ? 'green' : candidate.offer.response.action === 'decline' ? 'red' : 'amber'}>
                          {candidate.offer.response.action}ed
                        </Badge>
                        {candidate.offer.response.counterSalary && (
                          <span className="text-xs text-slate-400">Counter: {formatCurrency(candidate.offer.response.counterSalary, candidate.offer.currency)}</span>
                        )}
                      </div>
                      {candidate.offer.response.candidateNote && (
                        <p className="text-xs text-slate-400 mt-2">{candidate.offer.response.candidateNote}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* CV Extracted Data */}
          {cvData && (
            <ScrollReveal>
              <div className="glass-card p-5">
                <h2 className="font-display text-xs text-violet-400 mb-4">CV EXTRACT</h2>
                {(cvData.skills as string[])?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(cvData.skills as string[]).slice(0, 20).map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 bg-violet-500/10 text-violet-400/80 border border-violet-500/15 rounded-full text-[10px]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {(cvData.languages as string[])?.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Languages</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(cvData.languages as string[]).map((lang, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-500/10 text-blue-400/80 border border-blue-500/15 rounded-full text-[10px]">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollReveal>
          )}
        </div>

        {/* Right Column — Timeline + Sidebar Info */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <ScrollReveal>
            <div className="glass-card p-5 space-y-3">
              <h2 className="font-display text-xs text-violet-400 mb-3">DETAILS</h2>
              <div className="space-y-2 text-sm">
                {candidate.expectedSalary && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Expected</span>
                    <span className="text-slate-200">{formatCurrency(candidate.expectedSalary, candidate.currency)}</span>
                  </div>
                )}
                {candidate.source && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Source</span>
                    <span className="text-slate-200 capitalize">{candidate.source}</span>
                  </div>
                )}
                {candidate.assignedHR && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigned HR</span>
                    <span className="text-slate-200">{candidate.assignedHR.fullName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Added</span>
                  <span className="text-slate-200">{timeAgo(candidate.createdAt)}</span>
                </div>
              </div>
              {candidate.notes && (
                <div className="pt-3 border-t border-white/8">
                  <p className="text-xs text-slate-500 mb-1">Notes</p>
                  <p className="text-xs text-slate-400">{candidate.notes}</p>
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Activity Timeline */}
          <ScrollReveal>
            <div className="glass-card p-5">
              <h2 className="font-display text-xs text-violet-400 mb-4">ACTIVITY</h2>
              <CandidateTimeline events={candidate.auditEvents as AuditEvent[]} />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
