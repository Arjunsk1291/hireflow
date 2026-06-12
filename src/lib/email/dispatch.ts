import { sendMailFromSharedBox, type MailAttachment } from './graphMailer';
import { wrapEmailHtml } from './templates/wrapper';
import { prisma } from '@/lib/prisma';

function substituteVars(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

export async function sendTelecastEmail(
  triggerEvent: string,
  variables: Record<string, string>,
  recipientIds: string[],
  attachments?: MailAttachment[],
): Promise<{ sent: number; skipped: number }> {
  const config = await prisma.emailConfig.findUnique({ where: { triggerEvent } });
  if (!config || !config.isActive) return { sent: 0, skipped: recipientIds.length };

  const recipients = await prisma.profile.findMany({
    where: { id: { in: recipientIds }, isActive: true },
    select: { id: true, email: true, fullName: true },
  });

  let sent = 0;
  for (const recipient of recipients) {
    const vars = { ...variables, recipient_name: recipient.fullName };
    try {
      await sendMailFromSharedBox({
        to: recipient.email,
        replyTo: config.replyTo ?? undefined,
        subject: substituteVars(config.subject, vars),
        htmlBody: wrapEmailHtml(substituteVars(config.bodyHtml, vars)),
        attachments,
        saveToSent: true,
      });
      sent++;
    } catch (err) {
      console.error(`[email] Failed ${triggerEvent} to ${recipient.email}:`, err);
    }
  }
  return { sent, skipped: recipients.length - sent };
}

export async function sendDirectEmail(params: {
  to: string;
  subject: string;
  bodyHtml: string;
  attachments?: MailAttachment[];
}): Promise<void> {
  try {
    await sendMailFromSharedBox({
      to: params.to,
      subject: params.subject,
      htmlBody: wrapEmailHtml(params.bodyHtml),
      attachments: params.attachments,
      saveToSent: true,
    });
  } catch (err) {
    console.error('[email] Direct send failed:', err);
  }
}
