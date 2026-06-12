'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/guards';
import { insertAuditEvent } from '@/lib/audit';
import { createNotification } from '@/lib/notify';
import { sendTelecastEmail } from '@/lib/email/dispatch';
import { createTeamsMeeting } from '@/lib/teams/createMeeting';
import { generateIcs } from '@/lib/ics';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/types';

export async function scheduleInterview(params: {
  candidateId: string;
  roundNumber: number;
  roundName: string;
  mode: 'teams' | 'in_person' | 'phone';
  scheduledAt: Date;
  durationMins: number;
  panelIds: string[];
  leadPanelistId: string;
  location?: string;
  notes?: string;
}): Promise<ActionResult<{ interviewId: string }>> {
  const session = await requireAuth();

  let meetingLink: string | null = null;
  let teamsMeetingId: string | null = null;

  if (params.mode === 'teams') {
    const panelEmails = await prisma.profile.findMany({
      where: { id: { in: params.panelIds } },
      select: { email: true },
    });
    const candidate = await prisma.candidate.findUnique({ where: { id: params.candidateId } });
    const result = await createTeamsMeeting({
      subject: `Interview: ${candidate?.fullName} — ${params.roundName}`,
      startTime: params.scheduledAt,
      durationMins: params.durationMins,
      attendees: [...panelEmails.map((p) => p.email), candidate?.email ?? ''].filter(Boolean),
    });
    meetingLink     = result.meetingLink;
    teamsMeetingId  = result.teamsMeetingId;
  }

  const interview = await prisma.interview.create({
    data: {
      candidateId: params.candidateId,
      roundNumber: params.roundNumber,
      roundName: params.roundName,
      mode: params.mode as never,
      scheduledAt: params.scheduledAt,
      durationMins: params.durationMins,
      meetingLink,
      teamsMeetingId,
      location: params.location,
      notes: params.notes,
      status: 'scheduled',
      scheduledById: session.user.id,
      panel: {
        create: params.panelIds.map((panelistId) => ({
          panelistId,
          isLead: panelistId === params.leadPanelistId,
        })),
      },
    },
  });

  await prisma.candidate.update({
    where: { id: params.candidateId },
    data: { status: 'interview_scheduled' as never },
  });

  const candidate = await prisma.candidate.findUnique({ where: { id: params.candidateId } });
  const icsContent = generateIcs({
    title: `Interview: ${candidate?.fullName} — ${params.roundName}`,
    startDate: params.scheduledAt,
    durationMins: params.durationMins,
    location: params.location ?? meetingLink ?? undefined,
    meetingUrl: meetingLink ?? undefined,
    attendees: params.panelIds,
  });
  const icsAttachment = {
    name: 'interview-invite.ics',
    contentType: 'text/calendar',
    contentBytes: Buffer.from(icsContent).toString('base64'),
  };

  await sendTelecastEmail('interview_invited', {
    candidate_name: candidate?.fullName ?? '',
    round_name: params.roundName,
    meeting_time: params.scheduledAt.toUTCString(),
    meeting_link: meetingLink ?? 'See calendar invite',
    panelist_name: '{{recipient_name}}',
  }, params.panelIds, [icsAttachment]);

  for (const panelistId of params.panelIds) {
    await createNotification({
      userId: panelistId,
      title: `You're on the interview panel: ${candidate?.fullName}`,
      body: `${params.roundName} — ${params.scheduledAt.toUTCString()}`,
      link: `/candidates/${params.candidateId}/interview`,
      type: 'action_required',
      entityType: 'interview',
      entityId: interview.id,
    });
  }

  await insertAuditEvent({
    actorId: session.user.id,
    action: 'interview_scheduled',
    entityType: 'interview',
    entityId: interview.id,
    candidateId: params.candidateId,
    newData: { roundName: params.roundName, scheduledAt: params.scheduledAt, panelIds: params.panelIds },
  });

  revalidatePath(`/candidates/${params.candidateId}`);
  revalidatePath('/interviews');
  return { data: { interviewId: interview.id }, error: null };
}

export async function submitInterviewFeedback(params: {
  interviewId: string;
  scoreTechnical: number;
  scoreCommunication: number;
  scoreProblemSolving: number;
  scoreCultureFit: number;
  scoreDomainKnowledge: number;
  recommendation: 'strong_hire' | 'hire' | 'no_hire' | 'strong_no_hire';
  strengths: string;
  concerns: string;
  detailedNotes: string;
}): Promise<ActionResult<void>> {
  const session = await requireAuth();

  const interview = await prisma.interview.findUnique({
    where: { id: params.interviewId },
    include: { candidate: true },
  });
  if (!interview) return { data: null, error: 'Interview not found' };

  await prisma.interviewFeedback.upsert({
    where: { interviewId_panelistId: { interviewId: params.interviewId, panelistId: session.user.id } },
    update: {
      scoreTechnical: params.scoreTechnical,
      scoreCommunication: params.scoreCommunication,
      scoreProblemSolving: params.scoreProblemSolving,
      scoreCultureFit: params.scoreCultureFit,
      scoreDomainKnowledge: params.scoreDomainKnowledge,
      recommendation: params.recommendation as never,
      strengths: params.strengths,
      concerns: params.concerns,
      detailedNotes: params.detailedNotes,
      submittedAt: new Date(),
    },
    create: {
      interviewId: params.interviewId,
      panelistId: session.user.id,
      scoreTechnical: params.scoreTechnical,
      scoreCommunication: params.scoreCommunication,
      scoreProblemSolving: params.scoreProblemSolving,
      scoreCultureFit: params.scoreCultureFit,
      scoreDomainKnowledge: params.scoreDomainKnowledge,
      recommendation: params.recommendation as never,
      strengths: params.strengths,
      concerns: params.concerns,
      detailedNotes: params.detailedNotes,
      submittedAt: new Date(),
    },
  });

  await prisma.interview.update({
    where: { id: params.interviewId },
    data: { status: 'completed' },
  });

  if (interview.candidate.assignedHrId) {
    await createNotification({
      userId: interview.candidate.assignedHrId,
      title: `Interview feedback submitted: ${interview.candidate.fullName}`,
      link: `/candidates/${interview.candidateId}/feedback`,
      type: 'info',
      entityType: 'interview',
      entityId: params.interviewId,
    });
  }

  await insertAuditEvent({
    actorId: session.user.id,
    action: 'feedback_submitted',
    entityType: 'interview_feedback',
    entityId: params.interviewId,
    candidateId: interview.candidateId,
    newData: { recommendation: params.recommendation },
  });

  revalidatePath(`/candidates/${interview.candidateId}`);
  return { data: null, error: null };
}
