import { requireAuth } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { ScrollReveal } from '@/components/animation/ScrollReveal';
import { StaggerList } from '@/components/animation/StaggerList';
import { StatusBadge } from '@/components/candidates/StatusBadge';
import dynamic from 'next/dynamic';
import { Users, Calendar, CheckSquare, TrendingUp, Award, Clock } from 'lucide-react';
import { timeAgo, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

const PipelineScene = dynamic(
  () => import('@/components/three/PipelineScene').then((m) => ({ default: m.PipelineScene })),
  { ssr: false, loading: () => <div className="h-[280px] flex items-center justify-center text-slate-600 text-sm">Loading pipeline...</div> },
);

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
    <div className="p-8 max-w-7xl">
      <PageHeader
        title={`Good morning, ${userName}`}
        subtitle="Here's what's happening in your hiring pipeline today"
      />

      {/* Stats */}
      <ScrollReveal className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Candidates" value={totalCandidates} icon={Users} color="#f59e0b" />
        <StatCard title="Pending Reviews"  value={pendingReviews}  icon={Clock}  color="#60a5fa" />
        <StatCard title="Pending Approvals"value={pendingApprovals}icon={CheckSquare} color="#c084fc" />
        <StatCard title="Hired This Cycle" value={hired}           icon={Award}  color="#4ade80" />
      </ScrollReveal>

      {/* 3D Pipeline Hero */}
      <ScrollReveal className="glass-card mb-8 overflow-hidden">
        <div className="px-6 pt-5 pb-2">
          <h2 className="font-display text-sm text-amber-400 mb-1">HIRING PIPELINE</h2>
          <p className="text-xs text-slate-500">Live candidate distribution across all stages</p>
        </div>
        <div className="pipeline-hero">
          <PipelineScene stageCounts={stageCounts} />
        </div>
      </ScrollReveal>

      {/* Recent Candidates */}
      <ScrollReveal>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-sm text-slate-400">RECENT CANDIDATES</h2>
          <Link href="/candidates" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
            View all →
          </Link>
        </div>
        <StaggerList className="space-y-2" staggerDelay={0.06}>
          {recentCandidates.map((c) => (
            <Link key={c.id} href={`/candidates/${c.id}`} className="block">
              <div className="glass-card p-4 hover:border-amber-500/30 transition-colors cursor-pointer">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-100 truncate">{c.fullName}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
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
      <ScrollReveal className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Add Candidate', href: '/candidates/new', icon: '➕', color: 'amber' },
          { label: 'View Interviews', href: '/interviews', icon: '📅', color: 'blue' },
          { label: 'Pending Approvals', href: '/approvals', icon: '✅', color: 'purple' },
          { label: 'Reports', href: '/reports', icon: '📊', color: 'green' },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="glass-card p-4 hover:border-amber-500/30 transition-all cursor-pointer text-center group">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-xs font-medium text-slate-300 group-hover:text-amber-300 transition-colors">
                {item.label}
              </div>
            </div>
          </Link>
        ))}
      </ScrollReveal>
    </div>
  );
}
