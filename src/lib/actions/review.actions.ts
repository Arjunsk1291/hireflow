'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/guards';
import { insertAuditEvent } from '@/lib/audit';
import { createNotification } from '@/lib/notify';
import { sendTelecastEmail } from '@/lib/email/dispatch';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/types';

export async function assignCvReview(
  candidateId: string,
  reviewerId: string,
): Promise<ActionResult<void>> {
  const session = await requireAuth();

  const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
  if (!candidate) return { data: null, error: 'Candidate not found' };

  await prisma.cvReview.upsert({
    where: { candidateId_reviewerId: { candidateId, reviewerId } },
    update: {},
    create: { candidateId, reviewerId, assignedById: session.user.id },
  });

  await prisma.candidate.update({
    where: { id: candidateId },
    data: { status: 'cv_review' as never },
  });

  const reviewer = await prisma.profile.findUnique({ where: { id: reviewerId } });
  if (reviewer) {
    await createNotification({
      userId: reviewerId,
      title: `CV Review: ${candidate.fullName}`,
      body: `You have been assigned to review the CV for ${candidate.fullName} — ${candidate.appliedRoleTitle}`,
      link: `/candidates/${candidateId}/review`,
      type: 'action_required',
      entityType: 'candidate',
      entityId: candidateId,
    });

    await sendTelecastEmail('cv_assigned', {
      candidate_name: candidate.fullName,
      reviewer_name: reviewer.fullName,
      role_title: candidate.appliedRoleTitle,
      review_link: `${process.env.NEXT_PUBLIC_APP_URL}/candidates/${candidateId}/review`,
    }, [reviewerId]);
  }

  await insertAuditEvent({
    actorId: session.user.id,
    action: 'cv_review_assigned',
    entityType: 'cv_review',
    candidateId,
    newData: { reviewerId },
  });

  revalidatePath(`/candidates/${candidateId}`);
  return { data: null, error: null };
}

export async function submitCvReview(params: {
  reviewId: string;
  scoreTechnical: number;
  scoreExperience: number;
  scoreCulture: number;
  decision: 'shortlist' | 'reject' | 'hold';
  comments: string;
}): Promise<ActionResult<void>> {
  const session = await requireAuth();

  const review = await prisma.cvReview.findUnique({
    where: { id: params.reviewId },
    include: { candidate: true },
  });
  if (!review) return { data: null, error: 'Review not found' };
  if (review.reviewerId !== session.user.id) {
    const userRoles = ((session.user as Record<string, unknown>).roles as string[]) ?? [];
    if (!userRoles.includes('master')) return { data: null, error: 'Not your review' };
  }

  await prisma.cvReview.update({
    where: { id: params.reviewId },
    data: {
      scoreTechnical: params.scoreTechnical,
      scoreExperience: params.scoreExperience,
      scoreCulture: params.scoreCulture,
      decision: params.decision,
      comments: params.comments,
      completedAt: new Date(),
    },
  });

  const newStatus =
    params.decision === 'shortlist' ? 'cv_shortlisted' :
    params.decision === 'reject'    ? 'cv_rejected'    : 'cv_review';

  await prisma.candidate.update({
    where: { id: review.candidateId },
    data: { status: newStatus as never },
  });

  if (review.candidate.assignedHrId) {
    await createNotification({
      userId: review.candidate.assignedHrId,
      title: `CV Review completed: ${review.candidate.fullName} — ${params.decision}`,
      link: `/candidates/${review.candidateId}`,
      type: params.decision === 'shortlist' ? 'success' : 'info',
      entityType: 'candidate',
      entityId: review.candidateId,
    });
  }

  await insertAuditEvent({
    actorId: session.user.id,
    action: 'cv_review_submitted',
    entityType: 'cv_review',
    entityId: params.reviewId,
    candidateId: review.candidateId,
    newData: { decision: params.decision, score: params.scoreTechnical + params.scoreExperience + params.scoreCulture },
  });

  revalidatePath(`/candidates/${review.candidateId}`);
  return { data: null, error: null };
}
