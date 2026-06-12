'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/guards';
import { insertAuditEvent } from '@/lib/audit';
import { createNotification } from '@/lib/notify';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/types';
import { z } from 'zod';

const CreateCandidateSchema = z.object({
  fullName:        z.string().min(2),
  email:           z.string().email(),
  phone:           z.string().optional(),
  nationality:     z.string().optional(),
  currentLocation: z.string().optional(),
  currentTitle:    z.string().optional(),
  currentEmployer: z.string().optional(),
  yearsExperience: z.number().optional(),
  linkedinUrl:     z.string().optional(),
  source:          z.string().optional(),
  appliedRoleTitle:z.string().min(2),
  salaryBandId:    z.string().optional(),
  expectedSalary:  z.number().optional(),
  currency:        z.string().default('USD'),
  cvFilePath:      z.string().optional(),
  notes:           z.string().optional(),
  tags:            z.array(z.string()).default([]),
});

export async function createCandidate(input: z.infer<typeof CreateCandidateSchema>): Promise<ActionResult<{ id: string }>> {
  const session = await requireAuth();
  const parsed = CreateCandidateSchema.safeParse(input);
  if (!parsed.success) return { data: null, error: parsed.error.message };

  const data = parsed.data;
  const candidate = await prisma.candidate.create({
    data: {
      ...data,
      tags: JSON.stringify(data.tags),
      submittedById: session.user.id,
      assignedHrId: session.user.id,
    },
  });

  await insertAuditEvent({
    actorId: session.user.id,
    actorEmail: session.user.email!,
    action: 'candidate_created',
    entityType: 'candidate',
    entityId: candidate.id,
    candidateId: candidate.id,
    newData: { fullName: candidate.fullName, appliedRoleTitle: candidate.appliedRoleTitle },
  });

  revalidatePath('/candidates');
  return { data: { id: candidate.id }, error: null };
}

export async function updateCandidateStatus(
  candidateId: string,
  newStatus: string,
  notes?: string,
): Promise<ActionResult<void>> {
  const session = await requireAuth();

  const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
  if (!candidate) return { data: null, error: 'Candidate not found' };

  const oldStatus = candidate.status;
  await prisma.candidate.update({
    where: { id: candidateId },
    data: { status: newStatus as never, notes: notes ?? candidate.notes },
  });

  await insertAuditEvent({
    actorId: session.user.id,
    actorEmail: session.user.email!,
    action: 'status_changed',
    entityType: 'candidate',
    entityId: candidateId,
    candidateId,
    oldData: { status: oldStatus },
    newData: { status: newStatus, notes },
  });

  if (candidate.assignedHrId && candidate.assignedHrId !== session.user.id) {
    await createNotification({
      userId: candidate.assignedHrId,
      title: `${candidate.fullName} moved to ${newStatus.replace(/_/g, ' ')}`,
      link: `/candidates/${candidateId}`,
      type: 'info',
      entityType: 'candidate',
      entityId: candidateId,
    });
  }

  revalidatePath(`/candidates/${candidateId}`);
  revalidatePath('/candidates');
  return { data: null, error: null };
}

export async function updateCandidateNotes(candidateId: string, notes: string): Promise<ActionResult<void>> {
  await requireAuth();
  await prisma.candidate.update({ where: { id: candidateId }, data: { notes } });
  revalidatePath(`/candidates/${candidateId}`);
  return { data: null, error: null };
}

export async function deleteCandidate(candidateId: string): Promise<ActionResult<void>> {
  const session = await requireAuth();
  const userRoles = ((session.user as Record<string, unknown>).roles as string[]) ?? [];
  if (!userRoles.includes('master') && !userRoles.includes('hr_admin')) {
    return { data: null, error: 'Insufficient permissions' };
  }

  await prisma.candidate.delete({ where: { id: candidateId } });
  await insertAuditEvent({
    actorId: session.user.id,
    action: 'candidate_deleted',
    entityType: 'candidate',
    entityId: candidateId,
  });

  revalidatePath('/candidates');
  return { data: null, error: null };
}
