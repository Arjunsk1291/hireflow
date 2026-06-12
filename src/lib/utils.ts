import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined, fmt = 'MMM d, yyyy'): string {
  if (!date) return '—';
  return format(new Date(date), fmt);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—';
  return format(new Date(date), 'MMM d, yyyy HH:mm');
}

export function timeAgo(date: Date | string | null | undefined): string {
  if (!date) return '—';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatCurrency(amount: number | null | undefined, currency = 'USD'): string {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

export function generateInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function parseTags(tagsJson: string): string[] {
  try { return JSON.parse(tagsJson); } catch { return []; }
}

export function parseRoles(rolesJson: string): string[] {
  try { return JSON.parse(rolesJson); } catch { return []; }
}
