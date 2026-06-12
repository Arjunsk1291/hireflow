'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/guards';
import { insertAuditEvent } from '@/lib/audit';
import { createNotification } from '@/lib/notify';
import { sendDirectEmail } from '@/lib/email/dispatch';
import { generateOfferLetter } from '@/lib/pdf/offerLetter';
import { buildApprovalChain, approveOrRejectStep } from './approval.actions';
import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';
import { format } from 'date-fns';
import type { ActionResult } from '@/types';

export async function createOrUpdateOffer(params: {
  candidateId: string;
  offeredSalary: number;
  currency: string;
  salaryBandId?: string;
  outsideBand?: boolean;
  benefits?: string;
  startDate?: Date;
  contractType?: string;
  location?: string;
  reportingToId?: string;
  additionalNotes?: string;
}): Promise<ActionResult<{ offerId: string }>> {
  const session = await requireAuth();

  const existing = await prisma.offer.findUnique({ where: { candidateId: params.candidateId } });

  const offer = existing
    ? await prisma.offer.update({
        where: { candidateId: params.candidateId },
        data: { ...params, startDate: params.startDate, hrId: session.user.id },
      })
    : await prisma.offer.create({
        data: { ...params, startDate: params.startDate, hrId: session.user.id, status: 'draft' },
      });

  await prisma.candidate.update({
    where: { id: params.candidateId },
    data: { status: 'offer_drafted' as never },
  });

  await insertAuditEvent({
    actorId: session.user.id,
    action: existing ? 'offer_updated' : 'offer_created',
    entityType: 'offer',
    entityId: offer.id,
    candidateId: params.candidateId,
    newData: { offeredSalary: params.offeredSalary, currency: params.currency },
  });

  revalidatePath(`/candidates/${params.candidateId}/offer`);
  return { data: { offerId: offer.id }, error: null };
}

export async function generateOfferPdf(offerId: string): Promise<ActionResult<{ filePath: string }>> {
  const session = await requireAuth();

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { candidate: true, reportingTo: true, salaryBand: true },
  });
  if (!offer) return { data: null, error: 'Offer not found' };

  const filePath = await generateOfferLetter({
    candidateName: offer.candidate.fullName,
    roleTitle: offer.candidate.appliedRoleTitle,
    department: offer.salaryBand?.department ?? 'Engineering',
    offeredSalary: offer.offeredSalary ?? 0,
    currency: offer.currency,
    startDate: offer.startDate ? format(offer.startDate, 'MMMM d, yyyy') : 'TBD',
    contractType: offer.contractType ?? 'Full-Time',
    location: offer.location ?? 'Dubai',
    reportingTo: offer.reportingTo?.fullName ?? 'To be confirmed',
    benefits: offer.benefits ?? '',
    additionalNotes: offer.additionalNotes ?? '',
    generatedAt: format(new Date(), 'MMM d, yyyy'),
  }, offer.candidateId);

  await prisma.offer.update({ where: { id: offerId }, data: { offerLetterPath: filePath } });

  await insertAuditEvent({
    actorId: session.user.id,
    action: 'offer_pdf_generated',
    entityType: 'offer',
    entityId: offerId,
    candidateId: offer.candidateId,
  });

  revalidatePath(`/candidates/${offer.candidateId}/offer`);
  return { data: { filePath }, error: null };
}

export async function submitOfferForApproval(offerId: string): Promise<ActionResult<void>> {
  const session = await requireAuth();

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { candidate: true },
  });
  if (!offer) return { data: null, error: 'Offer not found' };

  await buildApprovalChain(offerId, offer.outsideBand);

  await prisma.offer.update({ where: { id: offerId }, data: { status: 'pending_approval' } });
  await prisma.candidate.update({
    where: { id: offer.candidateId },
    data: { status: 'offer_pending_approval' as never },
  });

  const panelLeads = await prisma.profile.findMany({
    where: { roles: { contains: 'team_lead' }, isActive: true },
    select: { id: true },
  });
  for (const lead of panelLeads) {
    await createNotification({
      userId: lead.id,
      title: `Offer approval needed: ${offer.candidate.fullName}`,
      link: '/approvals',
      type: 'action_required',
      entityType: 'offer',
      entityId: offerId,
    });
  }

  await insertAuditEvent({
    actorId: session.user.id,
    action: 'offer_submitted_for_approval',
    entityType: 'offer',
    entityId: offerId,
    candidateId: offer.candidateId,
  });

  revalidatePath(`/candidates/${offer.candidateId}/offer`);
  revalidatePath('/approvals');
  return { data: null, error: null };
}

export async function sendOfferToCandidate(offerId: string): Promise<ActionResult<void>> {
  const session = await requireAuth();

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { candidate: true },
  });
  if (!offer) return { data: null, error: 'Offer not found' };
  if (offer.status !== 'offer_approved' && offer.status !== 'approved') {
    return { data: null, error: 'Offer must be approved before sending' };
  }

  const token = nanoid(32);
  const tokenExpiresAt = new Date(Date.now() + parseInt(process.env.OFFER_TOKEN_EXPIRY_DAYS ?? '7') * 86400000);

  await prisma.offer.update({ where: { id: offerId }, data: { token, tokenExpiresAt, status: 'sent' } });
  await prisma.candidate.update({
    where: { id: offer.candidateId },
    data: { status: 'offer_sent' as never },
  });

  const portalLink = `${process.env.NEXT_PUBLIC_APP_URL}/portal/offer/${token}`;

  await sendDirectEmail({
    to: offer.candidate.email,
    subject: 'Your Offer from Avenir International Engineers',
    bodyHtml: `<p>Dear ${offer.candidate.fullName},</p>
<p>Congratulations! We are pleased to offer you the position of <strong>${offer.candidate.appliedRoleTitle}</strong> at Avenir International Engineers.</p>
<p>Please review your offer by clicking the link below. This link is valid for 7 days.</p>
<p><a href="${portalLink}">View Your Offer →</a></p>
<p>Warm regards,<br>HR Team, Avenir International Engineers</p>`,
  });

  await insertAuditEvent({
    actorId: session.user.id,
    action: 'offer_sent',
    entityType: 'offer',
    entityId: offerId,
    candidateId: offer.candidateId,
    newData: { sentTo: offer.candidate.email, portalLink },
  });

  revalidatePath(`/candidates/${offer.candidateId}/offer`);
  return { data: null, error: null };
}

export { approveOrRejectStep };
