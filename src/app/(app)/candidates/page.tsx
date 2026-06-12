import { requireAuth } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/layout/PageHeader';
import { CandidateCard } from '@/components/candidates/CandidateCard';
import { StaggerList } from '@/components/animation/StaggerList';
import { ScrollReveal } from '@/components/animation/ScrollReveal';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import type { CandidateWithRelations } from '@/types';

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string }>;
}

export default async function CandidatesPage({ searchParams }: PageProps) {
  const session = await requireAuth();
  const params = await searchParams;

  const where: Record<string, unknown> = {};
  if (params.status && params.status !== 'all') where.status = params.status;
  if (params.search) {
    where.OR = [
      { fullName: { contains: params.search, mode: 'insensitive' } },
      { email: { contains: params.search, mode: 'insensitive' } },
      { appliedRoleTitle: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  const candidates = await prisma.candidate.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { assignedHR: true, submittedBy: true },
  }) as unknown as CandidateWithRelations[];

  const statusCounts = await prisma.candidate.groupBy({
    by: ['status'],
    _count: true,
  });

  const allStatuses = [
    { value: 'all', label: 'All' },
    { value: 'cv_submitted', label: 'New' },
    { value: 'cv_review', label: 'In Review' },
    { value: 'cv_shortlisted', label: 'Shortlisted' },
    { value: 'interview_scheduled', label: 'Interviews' },
    { value: 'offer_pending_approval', label: 'Offers' },
    { value: 'hired', label: 'Hired' },
  ];

  return (
    <div className="p-8 max-w-7xl">
      <PageHeader
        title="Candidates"
        subtitle={`${candidates.length} candidates in the pipeline`}
        actions={
          <Link href="/candidates/new">
            <Button>
              <Plus size={16} />
              Add Candidate
            </Button>
          </Link>
        }
      />

      {/* Status Tabs */}
      <ScrollReveal>
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {allStatuses.map((s) => {
            const count = s.value === 'all'
              ? candidates.length
              : statusCounts.find((c) => c.status === s.value)?._count ?? 0;
            const isActive = (params.status ?? 'all') === s.value;

            return (
              <Link
                key={s.value}
                href={s.value === 'all' ? '/candidates' : `/candidates?status=${s.value}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/4'
                }`}
              >
                {s.label}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-amber-500/20' : 'bg-white/6'}`}>
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </ScrollReveal>

      {candidates.length === 0 ? (
        <ScrollReveal>
          <div className="glass-card p-16 text-center">
            <Users size={48} className="text-slate-700 mx-auto mb-4" />
            <h3 className="text-slate-400 font-medium mb-2">No candidates found</h3>
            <p className="text-slate-600 text-sm mb-6">Add your first candidate to get started</p>
            <Link href="/candidates/new">
              <Button>
                <Plus size={16} />
                Add Candidate
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      ) : (
        <StaggerList
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          staggerDelay={0.06}
        >
          {candidates.map((c) => (
            <CandidateCard key={c.id} candidate={c} />
          ))}
        </StaggerList>
      )}
    </div>
  );
}
