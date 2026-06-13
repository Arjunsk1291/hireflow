import { requireAuth } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/layout/PageHeader';
import { ScrollReveal } from '@/components/animation/ScrollReveal';
import { ApprovalChainStatus } from '@/components/offer/ApprovalChainStatus';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatCurrency, timeAgo } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';
import type { OfferApproval, Profile } from '@/types';

export default async function ApprovalsPage() {
  const session = await requireAuth();

  const offers = await prisma.offer.findMany({
    where: {
      approvals: { some: { status: { in: ['pending', 'approved', 'rejected'] } } },
    },
    include: {
      candidate: { select: { id: true, fullName: true, appliedRoleTitle: true } },
      approvals: {
        include: { approver: true },
        orderBy: { stepOrder: 'asc' },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const myPendingOffers = offers.filter((o) =>
    o.approvals.some((a) => a.status === 'pending' && a.approverId === session.user.id)
  );
  const otherOffers = offers.filter((o) =>
    !o.approvals.some((a) => a.status === 'pending' && a.approverId === session.user.id)
  );

  return (
    <div className="p-8 max-w-4xl">
      <PageHeader
        title="Offer Approvals"
        subtitle={`${myPendingOffers.length} pending your action`}
      />

      {myPendingOffers.length > 0 && (
        <ScrollReveal>
          <h2 className="font-display text-xs text-violet-400 mb-4">NEEDS YOUR ACTION</h2>
          <div className="space-y-4 mb-10">
            {myPendingOffers.map((offer) => (
              <Link key={offer.id} href={`/candidates/${offer.candidate.id}/offer`}>
                <div className="glass-card p-5 hover:border-violet-500/40 transition-colors cursor-pointer border border-violet-500/20">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <Avatar name={offer.candidate.fullName} size="sm" />
                      <div>
                        <div className="font-medium text-slate-100">{offer.candidate.fullName}</div>
                        <div className="text-xs text-violet-400">{offer.candidate.appliedRoleTitle}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {formatCurrency(offer.offeredSalary ?? 0, offer.currency)}
                          {offer.outsideBand && <span className="ml-2 text-orange-400">⚠ Outside Band</span>}
                        </div>
                      </div>
                    </div>
                    <Badge variant="amber">Awaiting You</Badge>
                  </div>
                  <ApprovalChainStatus approvals={offer.approvals as (OfferApproval & { approver?: Profile | null })[]} />
                </div>
              </Link>
            ))}
          </div>
        </ScrollReveal>
      )}

      {otherOffers.length > 0 && (
        <ScrollReveal delay={0.1}>
          <h2 className="font-display text-xs text-slate-500 mb-4">ALL OFFERS IN APPROVAL</h2>
          <div className="space-y-3">
            {otherOffers.map((offer) => {
              const pendingCount = offer.approvals.filter((a) => a.status === 'pending').length;
              const approvedCount = offer.approvals.filter((a) => a.status === 'approved').length;
              const isRejected = offer.approvals.some((a) => a.status === 'rejected');
              const isFullyApproved = pendingCount === 0 && !isRejected;

              return (
                <Link key={offer.id} href={`/candidates/${offer.candidate.id}/offer`}>
                  <div className="glass-card p-4 hover:border-white/15 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar name={offer.candidate.fullName} size="sm" />
                        <div>
                          <div className="text-sm font-medium text-slate-200">{offer.candidate.fullName}</div>
                          <div className="text-xs text-slate-500">
                            {formatCurrency(offer.offeredSalary ?? 0, offer.currency)} · {timeAgo(offer.updatedAt)}
                          </div>
                        </div>
                      </div>
                      <Badge variant={isRejected ? 'red' : isFullyApproved ? 'green' : 'default'}>
                        {isRejected ? 'Rejected' : isFullyApproved ? `${approvedCount}/${offer.approvals.length} Approved` : `${pendingCount} Pending`}
                      </Badge>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </ScrollReveal>
      )}

      {offers.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
          <p>No offers in approval pipeline.</p>
        </div>
      )}
    </div>
  );
}
