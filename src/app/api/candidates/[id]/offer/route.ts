import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    select: { id: true, fullName: true, appliedRoleTitle: true, email: true },
  });

  const offer = await prisma.offer.findUnique({
    where: { candidateId: id },
    include: {
      approvals: { include: { approver: true }, orderBy: { stepOrder: 'asc' } },
      response: true,
    },
  });

  return NextResponse.json({ candidate, offer });
}
