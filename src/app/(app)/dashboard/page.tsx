import { requireAuth } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/layout/PageHeader';
import { ScrollReveal } from '@/components/animation/ScrollReveal';
import { StaggerList } from '@/components/animation/StaggerList';
import { StatusBadge } from '@/components/candidates/StatusBadge';
import { timeAgo, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { PipelineFunnel } from '@/components/dashboard/PipelineFunnel';
import { DashboardStats } from '@/components/dashboard/DashboardStats';

async function getDashboardData() {
  const [
    totalCandidates,
    pendingReviews,
    pendingApprovals,
    hired,
    recentCandidates,
    stageCounts,
  ] = await Promise.all([
    prisma.candidate.count(),
    prisma.candidate.count({ where: { status: { in: ['cv_review', 'cv_submitted'] } } }),
    prisma.offerApproval.count({ where: { status: 'pending' } }),
    prisma.candidate.count({ where: { status: 'hired' } }),
    prisma.candidate.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      select: { id: true, fullName: true, appliedRoleTitle: true, status: true, createdAt: true, currentEmployer: true },
    }),
    Promise.all([
      prisma.candidate.count({ where: { status: { in: ['cv_submitted'] } } }),
      prisma.candidate.count({ where: { status: 'cv_review' } }),
      prisma.candidate.count({ where: { status: 'cv_shortlisted' } }),
      prisma.candidate.count({ where: { status: { in: ['interview_scheduled', 'interview_complete'] } } }),
      prisma.candidate.count({ where: { status: 'interview_complete' } }),
      prisma.candidate.count({ where: { status: { in: ['offer_drafted', 'offer_pending_approval', 'offer_approved', 'offer_sent'] } } }),
      prisma.candidate.count({ where: { status: 'offer_approved' } }),
      prisma.candidate.count({ where: { status: 'hired' } }),
    ]),
  ]);

  return { totalCandidates, pendingReviews, pendingApprovals, hired, recentCandidates, stageCounts };
}

export default async function DashboardPage() {
  const session = await requireAuth();
  const { totalCandidates, pendingReviews, pendingApprovals, hired, recentCandidates, stageCounts } = await getDashboardData();
  const userName = session.user.name?.split(' ')[0] ?? 'there';

  return (
    <div className="p-5 sm:p-7 lg:p-8 max-w-7xl mx-auto">
      <PageHeader
        title={`Good morning, ${userName}`}
        subtitle="Here's what's happening in your hiring pipeline today"
      />

      {/* Stats */}
      <DashboardStats
        totalCandidates={totalCandidates}
        pendingReviews={pendingReviews}
        pendingApprovals={pendingApprovals}
        hired={hired}
      />

      {/* Pipeline funnel */}
      <ScrollReveal className="glass-card p-6 mt-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-base text-slate-100">Hiring pipeline</h2>
            <p className="text-xs text-slate-500 mt-0.5">Live candidate distribution across all stages</p>
          </div>
          <Link href="/candidates" className="text-xs text-violet-300 hover:text-violet-200 transition-colors">View all →</Link>
        </div>
        <PipelineFunnel stageCounts={stageCounts} />
      </ScrollReveal>

      {/* Recent Candidates */}
      <ScrollReveal>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base text-slate-100">Recent candidates</h2>
          <Link href="/candidates" className="text-xs text-violet-300 hover:text-violet-200 transition-colors">
            View all →
          </Link>
        </div>
        <StaggerList className="space-y-2.5" staggerDelay={0.06}>
          {recentCandidates.map((c) => (
            <Link key={c.id} href={`/candidates/${c.id}`} className="block">
              <div className="tactile glass-card p-4 cursor-pointer">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-medium text-slate-100 truncate">{c.fullName}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {c.appliedRoleTitle}
                      {c.currentEmployer && ` · ${c.currentEmployer}`}
                    </div>
                  </div>
                  <span className="text-xs text-slate-600 shrink-0">{timeAgo(c.createdAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </StaggerList>
      </ScrollReveal>

      {/* Quick Links */}
      <ScrollReveal className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Add Candidate', href: '/candidates/new', desc: 'New CV intake' },
          { label: 'Interviews', href: '/interviews', desc: 'Schedule & panels' },
          { label: 'Approvals', href: '/approvals', desc: 'Pending sign-offs' },
          { label: 'Reports', href: '/reports', desc: 'Pipeline analytics' },
        ].map((item, i) => (
          <Link key={item.href} href={item.href}>
            <div className="glass-card p-5 cursor-pointer group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/0 group-hover:via-violet-500/60 to-transparent transition-all duration-500" />
              <div className="font-mono text-[10px] text-slate-600 group-hover:text-violet-500/80 transition-colors">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="font-display text-sm text-slate-200 group-hover:text-violet-300 mt-3 transition-colors">
                {item.label}
              </div>
              <div className="text-[11px] text-slate-600 mt-1">{item.desc}</div>
            </div>
          </Link>
        ))}
      </ScrollReveal>
    </div>
  );
}
