import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import path from 'path';
import fs from 'fs';
import { nanoid } from 'nanoid';

export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('cv') as File | null;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const maxBytes = parseInt(process.env.MAX_FILE_SIZE_MB ?? '15') * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json({ error: `File too large (max ${process.env.MAX_FILE_SIZE_MB ?? 15}MB)` }, { status: 400 });
    }

    const allowedExts = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.name).toLowerCase();
    if (!allowedExts.includes(ext)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? './uploads', 'cv');
    fs.mkdirSync(uploadDir, { recursive: true });

    const filename = `${nanoid(16)}${ext}`;
    const filePath = path.join(uploadDir, filename);
    const bytes    = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(bytes));

    return NextResponse.json({ filePath: `cv/${filename}`, filename });
  } catch (err) {
    console.error('[cv-upload]', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
