import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const [candidate, profiles] = await Promise.all([
    prisma.candidate.findUnique({
      where: { id },
      include: {
        cvReviews: { select: { id: true, reviewerId: true } },
        interviews: { select: { id: true, roundNumber: true, status: true } },
      },
    }),
    prisma.profile.findMany({
      where: { isActive: true },
      select: { id: true, fullName: true, title: true, roles: true },
      orderBy: { fullName: 'asc' },
    }),
  ]);

  const myReview = candidate?.cvReviews.find((r) => r.reviewerId === session.user.id);

  return NextResponse.json({ candidate, profiles, myReviewId: myReview?.id ?? null });
}
