import type { CvExtractedData } from '@/types';

const SECTION = {
  summary:        /^\s*(summary|professional\s+summary|profile|objective|about\s+me|career\s+objective)\s*:?\s*$/im,
  skills:         /^\s*(skills?|technical\s+skills?|core\s+competencies|technologies|expertise|key\s+skills?)\s*:?\s*$/im,
  experience:     /^\s*(experience|work\s+experience|professional\s+experience|employment\s+history|career\s+history)\s*:?\s*$/im,
  education:      /^\s*(education|academic\s+background|qualifications?|educational\s+background)\s*:?\s*$/im,
  certifications: /^\s*(certifications?|certificates?|professional\s+certifications?|licenses?\s+&?\s+certifications?)\s*:?\s*$/im,
  languages:      /^\s*(languages?|language\s+proficiency|language\s+skills?)\s*:?\s*$/im,
};

const PATTERNS = {
  email:     /[\w.+%-]+@[\w.-]+\.[a-z]{2,}/gi,
  phone:     /(\+?\d{1,3}[\s\-.]?)?\(?\d{2,4}\)?[\s\-.]?\d{3,4}[\s\-.]?\d{4}/g,
  linkedin:  /(?:linkedin\.com\/in\/)([\w\-%.]+)/gi,
  dateRange: /(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z.]*[\s,]+)?(?:19|20)\d{2}\s*[-–—to]+\s*(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z.]*[\s,]+)?(?:(?:19|20)\d{2}|present|current|now|ongoing)/gi,
};

const KNOWN_LANGUAGES = ['english','arabic','french','german','spanish','mandarin','hindi','urdu','portuguese','russian','japanese','korean','italian','dutch','turkish'];

function extractName(lines: string[]): string | undefined {
  for (const line of lines.slice(0, 6)) {
    const clean = line.trim().replace(/[^a-zA-Z\s'-]/g, '');
    if (!clean) continue;
    const words = clean.split(/\s+/).filter((w) => w.length >= 2);
    if (words.length >= 2 && words.length <= 5) {
      const joined = words.join(' ').toLowerCase();
      if (/curriculum|vitae|resume|cv\b|profile|contact/.test(joined)) continue;
      const looksLikeName = words.every((w) => /^[A-Z][a-zA-Z'-]*$/.test(w) || /^[A-Z]{2,}$/.test(w));
      if (looksLikeName) return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
  }
  return undefined;
}

interface ParsedSection { name: string; content: string; }

function splitIntoSections(text: string): ParsedSection[] {
  const lines = text.split('\n');
  const sections: ParsedSection[] = [];
  let currentSection = 'header';
  let currentLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    let matched: string | null = null;
    for (const [name, pattern] of Object.entries(SECTION)) {
      if (pattern.test(trimmed)) { matched = name; break; }
    }
    if (matched) {
      sections.push({ name: currentSection, content: currentLines.join('\n') });
      currentSection = matched;
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }
  sections.push({ name: currentSection, content: currentLines.join('\n') });
  return sections;
}

interface ExperienceItem { company: string; title: string; duration: string; description?: string; }

function parseExperienceBlock(content: string): ExperienceItem[] {
  const items: ExperienceItem[] = [];
  const blocks = content.split(/\n{2,}/);
  const titleKw = /engineer|manager|analyst|director|lead|specialist|officer|consultant|coordinator|supervisor|developer|scientist|geologist|designer|architect/i;

  for (const block of blocks) {
    const lines = block.trim().split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;
    const dateMatch = lines.join('\n').match(PATTERNS.dateRange);
    const duration = dateMatch ? dateMatch[0].trim() : '';
    let title = '', company = '';
    if (titleKw.test(lines[0])) {
      title = lines[0].replace(PATTERNS.dateRange, '').trim();
      company = lines[1]?.replace(PATTERNS.dateRange, '').trim() ?? '';
    } else {
      company = lines[0].replace(PATTERNS.dateRange, '').trim();
      title = lines[1]?.replace(PATTERNS.dateRange, '').trim() ?? '';
    }
    const descLines = lines.slice(2).filter((l) => !PATTERNS.dateRange.test(l));
    const description = descLines.join(' ').trim() || undefined;
    if (title || company) items.push({ title, company, duration, description });
  }
  return items;
}

interface EducationItem { institution: string; degree: string; year?: string; }

function parseEducationBlock(content: string): EducationItem[] {
  const items: EducationItem[] = [];
  const blocks = content.split(/\n{2,}/);
  const degreeKw = /bachelor|master|phd|doctorate|b\.?sc|m\.?sc|b\.?e|m\.?e|b\.?eng|m\.?eng|mba|bba|diploma|degree/i;

  for (const block of blocks) {
    const lines = block.trim().split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 1) continue;
    const yearMatch = block.match(/\b(19|20)\d{2}\b/);
    const year = yearMatch ? yearMatch[0] : undefined;
    let institution = '', degree = '';
    for (const line of lines) {
      if (degreeKw.test(line) && !degree) {
        degree = line.replace(/\b(19|20)\d{2}\b/g, '').trim();
      } else if (!institution && line.length > 4) {
        institution = line.replace(/\b(19|20)\d{2}\b/g, '').trim();
      }
    }
    if (institution || degree) items.push({ institution, degree, year });
  }
  return items;
}

function parseSkillsBlock(content: string): string[] {
  const skills: Set<string> = new Set();
  const tokens = content.split(/[,•|\n\/]+/).map((s) => s.trim()).filter((s) => s.length > 1 && s.length < 60);
  for (const token of tokens) {
    const clean = token.replace(/^[\s\-•*·]+/, '').trim();
    if (clean.length > 1 && clean.length < 50 && !/^\d+$/.test(clean)) skills.add(clean);
  }
  return [...skills].slice(0, 40);
}

function parseCertificationsBlock(content: string): string[] {
  return content.split(/[•|\n]+/).map((s) => s.replace(/^[\s\-•*·]+/, '').trim()).filter((s) => s.length > 3 && s.length < 100).slice(0, 20);
}

function parseLanguagesBlock(content: string): string[] {
  const found: string[] = [];
  const lower = content.toLowerCase();
  for (const lang of KNOWN_LANGUAGES) {
    if (lower.includes(lang)) found.push(lang.charAt(0).toUpperCase() + lang.slice(1));
  }
  const lines = content.split(/[,\n•]+/).map((s) => s.replace(/^[\s\-•*·]+/, '').trim()).filter((s) => s.length > 2 && s.length < 30);
  lines.forEach((l) => { if (!found.includes(l)) found.push(l); });
  return [...new Set(found)].slice(0, 8);
}

function buildSummary(sections: ParsedSection[], rawText: string): string {
  const summarySection = sections.find((s) => s.name === 'summary');
  if (summarySection?.content.trim()) {
    return summarySection.content.trim().split('\n').filter(Boolean).slice(0, 3).join(' ');
  }
  return rawText.split('\n').filter((l) => l.trim().length > 30).slice(0, 2).join(' ').slice(0, 300);
}

export function parseCvText(rawText: string): CvExtractedData {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const sections = splitIntoSections(rawText);

  PATTERNS.email.lastIndex = 0;
  PATTERNS.phone.lastIndex = 0;
  PATTERNS.linkedin.lastIndex = 0;

  const emails    = rawText.match(PATTERNS.email)    ?? [];
  const phones    = rawText.match(PATTERNS.phone)    ?? [];
  const linkedins = rawText.match(PATTERNS.linkedin) ?? [];

  const skillsSection = sections.find((s) => s.name === 'skills');
  const expSection    = sections.find((s) => s.name === 'experience');
  const eduSection    = sections.find((s) => s.name === 'education');
  const certSection   = sections.find((s) => s.name === 'certifications');
  const langSection   = sections.find((s) => s.name === 'languages');

  return {
    extractedName:  extractName(lines),
    extractedEmail: emails[0]?.toLowerCase(),
    extractedPhone: phones[0],
    linkedinUrl:    linkedins[0] ? `https://linkedin.com/in/${linkedins[0].replace(/.*linkedin\.com\/in\//i, '')}` : undefined,
    summary:        buildSummary(sections, rawText),
    skills:         skillsSection ? parseSkillsBlock(skillsSection.content) : [],
    experience:     expSection    ? parseExperienceBlock(expSection.content) : [],
    education:      eduSection    ? parseEducationBlock(eduSection.content)  : [],
    certifications: certSection   ? parseCertificationsBlock(certSection.content) : [],
    languages:      langSection   ? parseLanguagesBlock(langSection.content) : [],
    rawText:        rawText.slice(0, 3000),
  };
}
