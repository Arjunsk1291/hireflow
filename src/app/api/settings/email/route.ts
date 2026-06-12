import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ENV_PATH = join(process.cwd(), '.env.local');

function readEnvLocal(): Record<string, string> {
  try {
    const content = readFileSync(ENV_PATH, 'utf-8');
    const lines = content.split('\n');
    return Object.fromEntries(
      lines
        .filter((l) => l.includes('=') && !l.startsWith('#'))
        .map((l) => {
          const idx = l.indexOf('=');
          return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^"|"$/g, '')];
        })
    );
  } catch {
    return {};
  }
}

function writeEnvLocal(vars: Record<string, string>) {
  let content = '';
  try { content = readFileSync(ENV_PATH, 'utf-8'); } catch {}

  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    const line = `${key}="${value}"`;
    if (regex.test(content)) content = content.replace(regex, line);
    else content = content + `\n${line}`;
  }
  writeFileSync(ENV_PATH, content.trim() + '\n');
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const env = readEnvLocal();
  return NextResponse.json({
    config: {
      tenantId: env.AZURE_TENANT_ID ?? '',
      clientId: env.AZURE_CLIENT_ID ?? '',
      sharedMailbox: env.GRAPH_SHARED_MAILBOX ?? '',
      fromName: env.GRAPH_FROM_NAME ?? '',
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const updates: Record<string, string> = {};

  if (body.tenantId !== undefined) updates.AZURE_TENANT_ID = body.tenantId;
  if (body.clientId !== undefined) updates.AZURE_CLIENT_ID = body.clientId;
  if (body.clientSecret !== undefined) updates.AZURE_CLIENT_SECRET = body.clientSecret;
  if (body.sharedMailbox !== undefined) updates.GRAPH_SHARED_MAILBOX = body.sharedMailbox;
  if (body.fromName !== undefined) updates.GRAPH_FROM_NAME = body.fromName;

  writeEnvLocal(updates);
  return NextResponse.json({ ok: true });
}
