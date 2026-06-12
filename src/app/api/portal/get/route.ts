import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

  const offer = await prisma.offer.findUnique({
    where: { token },
    include: {
      candidate: { select: { fullName: true, email: true, appliedRoleTitle: true } },
      salaryBand: { select: { roleTitle: true, department: true } },
      reportingTo: { select: { fullName: true, title: true } },
      response: true,
    },
  });

  if (!offer) return NextResponse.json({ error: 'Offer not found' }, { status: 404 });

  if (offer.tokenExpiresAt && new Date() > offer.tokenExpiresAt) {
    return NextResponse.json({ error: 'Offer link has expired' }, { status: 410 });
  }

  return NextResponse.json({
    id: offer.id,
    candidateName: offer.candidate.fullName,
    candidateEmail: offer.candidate.email,
    roleTitle: offer.candidate.appliedRoleTitle,
    department: offer.salaryBand?.department ?? '',
    offeredSalary: offer.offeredSalary,
    currency: offer.currency,
    startDate: offer.startDate,
    contractType: offer.contractType,
    location: offer.location,
    reportingTo: offer.reportingTo?.fullName,
    benefits: offer.benefits,
    additionalNotes: offer.additionalNotes,
    offerLetterPath: offer.offerLetterPath,
    status: offer.status,
    expiresAt: offer.tokenExpiresAt,
    response: offer.response,
  });
}
