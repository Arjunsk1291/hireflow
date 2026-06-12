import { requireAuth } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/layout/PageHeader';
import { ScrollReveal } from '@/components/animation/ScrollReveal';
import { StatCard } from '@/components/dashboard/StatCard';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Users, UserCheck, Clock, TrendingUp, BarChart3, Award } from 'lucide-react';

export default async function ReportsPage() {
  await requireAuth();

  const [
    totalCandidates,
    statusGroups,
    sourceGroups,
    avgSalary,
    offersData,
    interviewData,
    recentHires,
  ] = await Promise.all([
    prisma.candidate.count(),
    prisma.candidate.groupBy({ by: ['status'], _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
    prisma.candidate.groupBy({ by: ['source'], _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
    prisma.candidate.aggregate({ _avg: { expectedSalary: true } }),
    prisma.offer.count(),
    prisma.interview.aggregate({ _count: { id: true }, _avg: { durationMins: true } }),
    prisma.candidate.findMany({
      where: { status: { in: ['hired', 'offer_accepted'] } },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: { id: true, fullName: true, appliedRoleTitle: true, updatedAt: true, offer: { select: { offeredSalary: true, currency: true } } },
    }),
  ]);

  const hired = statusGroups.find((s) => s.status === 'hired')?._count.id ?? 0;
  const rejected = statusGroups.find((s) => (s.status as string) === 'cv_rejected')?._count.id ?? 0;
  const conversionRate = totalCandidates > 0 ? ((hired / totalCandidates) * 100).toFixed(1) : '0';

  return (
    <div className="p-8">
      <PageHeader title="Reports & Analytics" subtitle="Pipeline health and hiring metrics" />

      {/* KPI Cards */}
      <ScrollReveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Candidates" value={totalCandidates} icon={Users} trend={0} />
          <StatCard title="Hired" value={hired} icon={UserCheck} trend={0} color="#22c55e" />
          <StatCard title="Offers Sent" value={offersData} icon={Award} trend={0} color="#f59e0b" />
          <StatCard title="Conversion Rate" value={Number(conversionRate)} icon={TrendingUp} trend={0} suffix="%" color="#3b82f6" />
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pipeline Status Breakdown */}
        <ScrollReveal>
          <div className="glass-card p-6">
            <h2 className="font-display text-xs text-amber-400 mb-5 flex items-center gap-2">
              <BarChart3 size={14} /> PIPELINE STATUS
            </h2>
            <div className="space-y-3">
              {statusGroups.map(({ status, _count }) => {
                const pct = totalCandidates > 0 ? (_count.id / totalCandidates) * 100 : 0;
                return (
                  <div key={status}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400 capitalize">{status.replace(/_/g, ' ')}</span>
                      <span className="text-slate-300">{_count.id}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* Source Breakdown */}
        <ScrollReveal delay={0.1}>
          <div className="glass-card p-6">
            <h2 className="font-display text-xs text-amber-400 mb-5">SOURCE BREAKDOWN</h2>
            <div className="space-y-3">
              {sourceGroups.filter((s) => s.source).map(({ source, _count }) => {
                const pct = totalCandidates > 0 ? (_count.id / totalCandidates) * 100 : 0;
                const colors = ['from-blue-500 to-blue-400', 'from-purple-500 to-purple-400', 'from-green-500 to-green-400', 'from-rose-500 to-rose-400'];
                const ci = sourceGroups.indexOf({ source, _count } as typeof sourceGroups[0]) % colors.length;
                return (
                  <div key={source}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400 capitalize">{source}</span>
                      <span className="text-slate-300">{_count.id} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${colors[ci] ?? colors[0]} rounded-full`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {sourceGroups.filter((s) => !s.source).length > 0 && (
                <div className="text-xs text-slate-600">
                  {sourceGroups.find((s) => !s.source)?._count.id} without source
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Salary Insights */}
        <ScrollReveal>
          <div className="glass-card p-6">
            <h2 className="font-display text-xs text-amber-400 mb-5">SALARY INSIGHTS</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/3 rounded-lg">
                <span className="text-xs text-slate-400">Avg Expected Salary</span>
                <span className="text-sm font-medium text-slate-200">
                  {avgSalary._avg.expectedSalary
                    ? formatCurrency(avgSalary._avg.expectedSalary, 'USD')
                    : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/3 rounded-lg">
                <span className="text-xs text-slate-400">Avg Interview Duration</span>
                <span className="text-sm font-medium text-slate-200">
                  {interviewData._avg.durationMins
                    ? `${Math.round(interviewData._avg.durationMins)}m`
                    : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/3 rounded-lg">
                <span className="text-xs text-slate-400">Rejection Rate</span>
                <span className="text-sm font-medium text-rose-400">
                  {totalCandidates > 0 ? ((rejected / totalCandidates) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Recent Hires */}
        <ScrollReveal delay={0.1}>
          <div className="glass-card p-6">
            <h2 className="font-display text-xs text-amber-400 mb-5">RECENT HIRES</h2>
            {recentHires.length === 0 ? (
              <p className="text-xs text-slate-500">No hires recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {recentHires.map((hire) => (
                  <div key={hire.id} className="flex items-center justify-between p-2 bg-white/3 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-slate-200">{hire.fullName}</div>
                      <div className="text-xs text-slate-500">{hire.appliedRoleTitle}</div>
                    </div>
                    {hire.offer?.offeredSalary && (
                      <div className="text-xs text-amber-400">{formatCurrency(hire.offer.offeredSalary, hire.offer.currency ?? 'USD')}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
