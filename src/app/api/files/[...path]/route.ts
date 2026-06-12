import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import path from 'path';
import fs from 'fs';

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { path: pathParts } = await params;
  const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? './uploads');
  const filePath  = path.join(uploadDir, ...pathParts);
  const resolved  = path.resolve(filePath);

  if (!resolved.startsWith(uploadDir)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!fs.existsSync(resolved)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const buffer = fs.readFileSync(resolved);
  const ext    = path.extname(resolved).toLowerCase();
  const contentTypeMap: Record<string, string> = {
    '.pdf':  'application/pdf',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.doc':  'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  const contentType = contentTypeMap[ext] ?? 'application/octet-stream';

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
