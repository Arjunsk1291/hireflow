import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { extractCvFromPath } from '@/lib/cv';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { file_path } = await req.json();
  if (!file_path) return NextResponse.json({ error: 'file_path required' }, { status: 400 });

  const extracted = await extractCvFromPath(file_path);
  return NextResponse.json({ data: extracted });
}
