import { format } from 'date-fns';
import { nanoid } from 'nanoid';

interface IcsParams {
  uid?: string;
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  durationMins?: number;
  organizer?: string;
  attendees?: string[];
  meetingUrl?: string;
}

function icsDate(d: Date): string {
  return format(d, "yyyyMMdd'T'HHmmss'Z'");
}

export function generateIcs(params: IcsParams): string {
  const uid = params.uid ?? `hireflow-${nanoid(12)}@avenir.local`;
  const start = params.startDate;
  const end = new Date(start.getTime() + (params.durationMins ?? 60) * 60 * 1000);
  const now = new Date();

  const attendeeLines = (params.attendees ?? [])
    .map((email) => `ATTENDEE;RSVP=TRUE:mailto:${email}`)
    .join('\n');

  const desc = [params.description, params.meetingUrl ? `Teams: ${params.meetingUrl}` : '']
    .filter(Boolean)
    .join('\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HireFlow//Avenir International Engineers//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${icsDate(now)}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${params.title}`,
    desc ? `DESCRIPTION:${desc}` : '',
    params.location ? `LOCATION:${params.location}` : '',
    params.organizer ? `ORGANIZER:mailto:${params.organizer}` : '',
    attendeeLines,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');
}
