import { prisma } from '@/lib/prisma';

export async function createNotification(params: {
  userId: string;
  title: string;
  body?: string;
  link?: string;
  type?: string;
  entityType?: string;
  entityId?: string;
}) {
  const notification = await prisma.notification.create({
    data: {
      userId: params.userId,
      title: params.title,
      body: params.body,
      link: params.link,
      type: params.type ?? 'info',
      entityType: params.entityType,
      entityId: params.entityId,
    },
  });

  const io = (global as Record<string, unknown>).io as { to: (room: string) => { emit: (ev: string, data: unknown) => void } } | undefined;
  if (io) {
    io.to(`user:${params.userId}`).emit('notification', notification);
  }
  return notification;
}
