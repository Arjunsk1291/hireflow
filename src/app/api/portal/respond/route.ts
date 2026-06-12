import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { insertAuditEvent } from '@/lib/audit';
import { createNotification } from '@/lib/notify';
import { z } from 'zod';

const RespondSchema = z.object({
  token:         z.string().min(1),
  action:        z.enum(['accept', 'decline', 'counter']),
  counterSalary: z.number().optional(),
  candidateNote: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = RespondSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const { token, action, counterSalary, candidateNote } = parsed.data;

  const offer = await prisma.offer.findUnique({
    where: { token },
    include: { candidate: true },
  });

  if (!offer) return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
  if (offer.tokenExpiresAt && new Date() > offer.tokenExpiresAt) {
    return NextResponse.json({ error: 'Offer link expired' }, { status: 410 });
  }

  // Idempotency — already responded
  const existing = await prisma.offerResponse.findUnique({ where: { offerId: offer.id } });
  if (existing) return NextResponse.json({ message: 'Already responded', response: existing });

  await prisma.offerResponse.create({
    data: { offerId: offer.id, action, counterSalary, candidateNote },
  });

  const newStatus =
    action === 'accept'  ? 'offer_accepted' :
    action === 'decline' ? 'offer_declined' :
    'offer_countered';

  await prisma.offer.update({ where: { id: offer.id }, data: { status: newStatus } });
  await prisma.candidate.update({
    where: { id: offer.candidateId },
    data: { status: newStatus as never },
  });

  if (offer.hrId) {
    await createNotification({
      userId: offer.hrId,
      title: `${offer.candidate.fullName} has ${action}ed the offer`,
      link: `/candidates/${offer.candidateId}/offer`,
      type: action === 'accept' ? 'success' : action === 'decline' ? 'warning' : 'info',
      entityType: 'offer',
      entityId: offer.id,
    });
  }

  await insertAuditEvent({
    action: `offer_${action}ed`,
    entityType: 'offer_response',
    entityId: offer.id,
    candidateId: offer.candidateId,
    actorEmail: offer.candidate.email,
    newData: { action, counterSalary, candidateNote },
  });

  return NextResponse.json({ message: 'Response submitted successfully' });
}
