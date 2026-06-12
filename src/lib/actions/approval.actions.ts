'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/guards';
import { insertAuditEvent } from '@/lib/audit';
import { createNotification } from '@/lib/notify';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/types';

export async function buildApprovalChain(offerId: string, outsideBand = false): Promise<void> {
  const steps: { step: 'panel_lead' | 'hr_admin' | 'svp' | 'finance_approver' | 'master'; stepOrder: number }[] = [
    { step: 'panel_lead',       stepOrder: 1 },
    { step: 'hr_admin',         stepOrder: 2 },
    { step: 'svp',              stepOrder: 3 },
  ];

  if (outsideBand) {
    steps.push({ step: 'finance_approver', stepOrder: 4 });
    steps.push({ step: 'master',           stepOrder: 5 });
  } else {
    steps.push({ step: 'master',           stepOrder: 4 });
  }

  await prisma.offerApproval.createMany({
    data: steps.map((s) => ({ ...s, offerId })),
  });
}

export async function approveOrRejectStep(
  approvalId: string,
  decision: 'approved' | 'rejected',
  comment?: string,
): Promise<ActionResult<void>> {
  const session = await requireAuth();

  const approval = await prisma.offerApproval.findUnique({
    where: { id: approvalId },
    include: { offer: { include: { candidate: true } } },
  });
  if (!approval) return { data: null, error: 'Approval not found' };

  const userRoles = ((session.user as Record<string, unknown>).roles as string[]) ?? [];
  if (!userRoles.includes('master')) {
    const priorSteps = await prisma.offerApproval.findMany({
      where: { offerId: approval.offerId, stepOrder: { lt: approval.stepOrder } },
    });
    if (priorSteps.some((s) => s.status !== 'approved')) {
      return { data: null, error: 'Prior approval steps not yet complete' };
    }
  }

  await prisma.offerApproval.update({
    where: { id: approvalId },
    data: {
      status: decision as never,
      comments: comment,
      decidedAt: new Date(),
      approverId: session.user.id,
    },
  });

  if (decision === 'rejected') {
    await prisma.offer.update({ where: { id: approval.offerId }, data: { status: 'draft' } });
    await prisma.candidate.update({
      where: { id: approval.offer.candidateId },
      data: { status: 'offer_drafted' as never },
    });
    if (approval.offer.hrId) {
      await createNotification({
        userId: approval.offer.hrId,
        title: `Offer rejected at ${approval.step.replace(/_/g, ' ')} step`,
        link: `/candidates/${approval.offer.candidateId}/offer`,
        type: 'warning',
        entityType: 'offer',
        entityId: approval.offerId,
      });
    }
  } else {
    const remaining = await prisma.offerApproval.count({
      where: { offerId: approval.offerId, status: 'pending', stepOrder: { gt: approval.stepOrder } },
    });

    if (remaining === 0) {
      await prisma.offer.update({ where: { id: approval.offerId }, data: { status: 'offer_approved' } });
      await prisma.candidate.update({
        where: { id: approval.offer.candidateId },
        data: { status: 'offer_approved' as never },
      });
      if (approval.offer.hrId) {
        await createNotification({
          userId: approval.offer.hrId,
          title: `Offer fully approved — ready to send: ${approval.offer.candidate.fullName}`,
          link: `/candidates/${approval.offer.candidateId}/offer`,
          type: 'success',
          entityType: 'offer',
          entityId: approval.offerId,
        });
      }
    } else {
      const nextStep = await prisma.offerApproval.findFirst({
        where: { offerId: approval.offerId, status: 'pending', stepOrder: { gt: approval.stepOrder } },
        orderBy: { stepOrder: 'asc' },
      });

      if (nextStep) {
        const nextRoleMap: Record<string, string> = {
          panel_lead: 'team_lead',
          hr_admin: 'hr_admin',
          svp: 'svp',
          finance_approver: 'finance_approver',
          master: 'master',
        };
        const nextRole = nextRoleMap[nextStep.step] ?? nextStep.step;
        const nextApprovers = await prisma.profile.findMany({
          where: { roles: { contains: nextRole }, isActive: true },
          select: { id: true },
        });
        for (const approver of nextApprovers) {
          await createNotification({
            userId: approver.id,
            title: `Offer approval required: ${approval.offer.candidate.fullName}`,
            link: '/approvals',
            type: 'action_required',
            entityType: 'offer',
            entityId: approval.offerId,
          });
        }
      }
    }
  }

  await insertAuditEvent({
    actorId: session.user.id,
    action: `offer_${decision}`,
    entityType: 'offer_approval',
    entityId: approval.offerId,
    candidateId: approval.offer.candidateId,
    newData: { step: approval.step, decision, comment },
  });

  revalidatePath('/approvals');
  revalidatePath(`/candidates/${approval.offer.candidateId}/offer`);
  return { data: null, error: null };
}
