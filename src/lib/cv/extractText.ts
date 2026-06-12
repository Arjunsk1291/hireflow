import path from 'path';
import fs from 'fs';

export async function extractRawText(relativeFilePath: string): Promise<string | null> {
  const fullPath = path.resolve(process.env.UPLOAD_DIR ?? './uploads', relativeFilePath);
  if (!fs.existsSync(fullPath)) return null;

  const buffer = fs.readFileSync(fullPath);
  const ext = path.extname(fullPath).toLowerCase();

  try {
    if (ext === '.pdf') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfModule = await import('pdf-parse') as any;
      const pdfParse = pdfModule.default ?? pdfModule;
      const result = await pdfParse(buffer);
      return result.text ?? null;
    }
    if (ext === '.docx' || ext === '.doc') {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return result.value ?? null;
    }
    return null;
  } catch (err) {
    console.error('[cv-extract] Text extraction failed:', err);
    return null;
  }
}
