import { prisma } from '@/lib/prisma';

export async function insertAuditEvent(params: {
  actorId?: string;
  actorEmail?: string;
  action: string;
  entityType: string;
  entityId?: string;
  candidateId?: string;
  oldData?: unknown;
  newData?: unknown;
  metadata?: unknown;
}) {
  return prisma.auditEvent.create({
    data: {
      actorId: params.actorId,
      actorEmail: params.actorEmail,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      candidateId: params.candidateId,
      oldData: params.oldData ? JSON.stringify(params.oldData) : null,
      newData: params.newData ? JSON.stringify(params.newData) : null,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    },
  });
}
