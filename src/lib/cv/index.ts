import { extractRawText } from './extractText';
import { parseCvText } from './localParser';
import type { CvExtractedData } from '@/types';

export async function extractCvFromPath(relativeFilePath: string): Promise<CvExtractedData | null> {
  const rawText = await extractRawText(relativeFilePath);
  if (!rawText || rawText.trim().length < 50) return null;
  return parseCvText(rawText);
}
