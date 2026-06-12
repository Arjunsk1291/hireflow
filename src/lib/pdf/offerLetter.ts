import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import path from 'path';
import fs from 'fs';

interface OfferLetterData {
  candidateName: string;
  roleTitle: string;
  department: string;
  offeredSalary: number;
  currency: string;
  startDate: string;
  contractType: string;
  location: string;
  reportingTo: string;
  benefits: string;
  additionalNotes: string;
  generatedAt: string;
}

export async function generateOfferLetter(data: OfferLetterData, candidateId: string): Promise<string> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const { width, height } = page.getSize();

  const boldFont   = await doc.embedFont(StandardFonts.HelveticaBold);
  const regularFont= await doc.embedFont(StandardFonts.Helvetica);

  const amber  = rgb(0.961, 0.620, 0.043);
  const navy   = rgb(0.020, 0.043, 0.078);
  const white  = rgb(1, 1, 1);
  const dark   = rgb(0.102, 0.118, 0.200);
  const muted  = rgb(0.580, 0.631, 0.722);

  // Header background
  page.drawRectangle({ x: 0, y: height - 90, width, height: 90, color: navy });
  // Amber accent bar
  page.drawRectangle({ x: 0, y: height - 93, width, height: 3, color: amber });

  // Company name
  page.drawText('AVENIR INTERNATIONAL ENGINEERS', {
    x: 40, y: height - 38, size: 14, font: boldFont, color: amber,
  });
  page.drawText('HireFlow — Official Offer of Employment', {
    x: 40, y: height - 58, size: 10, font: regularFont, color: muted,
  });
  page.drawText(data.generatedAt, {
    x: width - 160, y: height - 48, size: 9, font: regularFont, color: muted,
  });

  let y = height - 130;
  const leftMargin = 40;
  const lineH = 20;
  const sectionH = 32;

  const drawSection = (title: string) => {
    page.drawRectangle({ x: 0, y: y - 4, width, height: 24, color: rgb(0.063, 0.102, 0.176) });
    page.drawText(title, { x: leftMargin, y: y + 2, size: 10, font: boldFont, color: amber });
    y -= sectionH;
  };

  const drawRow = (label: string, value: string) => {
    page.drawText(`${label}:`, { x: leftMargin, y, size: 10, font: boldFont, color: dark });
    page.drawText(value, { x: 200, y, size: 10, font: regularFont, color: dark });
    y -= lineH;
  };

  // Greeting
  page.drawText(`Dear ${data.candidateName},`, { x: leftMargin, y, size: 12, font: boldFont, color: dark });
  y -= lineH;
  page.drawText('We are pleased to offer you the following position at Avenir International Engineers:', {
    x: leftMargin, y, size: 10, font: regularFont, color: dark,
  });
  y -= sectionH;

  drawSection('POSITION DETAILS');
  drawRow('Role Title', data.roleTitle);
  drawRow('Department', data.department);
  drawRow('Location', data.location);
  drawRow('Contract Type', data.contractType);
  drawRow('Start Date', data.startDate);
  drawRow('Reporting To', data.reportingTo);
  y -= 8;

  drawSection('COMPENSATION');
  drawRow('Base Salary', `${data.currency} ${Number(data.offeredSalary).toLocaleString()} per annum`);
  y -= 8;

  if (data.benefits) {
    drawSection('BENEFITS');
    const benefitLines = data.benefits.split('\n').slice(0, 6);
    for (const line of benefitLines) {
      page.drawText(`• ${line.trim()}`, { x: leftMargin, y, size: 10, font: regularFont, color: dark });
      y -= lineH;
    }
    y -= 8;
  }

  if (data.additionalNotes) {
    drawSection('ADDITIONAL NOTES');
    const noteLines = data.additionalNotes.split('\n').slice(0, 4);
    for (const line of noteLines) {
      page.drawText(line.trim(), { x: leftMargin, y, size: 10, font: regularFont, color: dark });
      y -= lineH;
    }
    y -= 8;
  }

  // Signature block
  y -= 20;
  page.drawText('This offer is conditional upon satisfactory background checks.', {
    x: leftMargin, y, size: 9, font: regularFont, color: muted,
  });
  y -= sectionH;

  page.drawText('________________________________', { x: leftMargin, y, size: 10, font: regularFont, color: dark });
  page.drawText('________________________________', { x: 300, y, size: 10, font: regularFont, color: dark });
  y -= lineH;
  page.drawText('Candidate Signature & Date', { x: leftMargin, y, size: 9, font: regularFont, color: muted });
  page.drawText('HR Authorised Signatory', { x: 300, y, size: 9, font: regularFont, color: muted });

  // Footer
  page.drawRectangle({ x: 0, y: 0, width, height: 30, color: navy });
  page.drawText('Avenir International Engineers — Confidential — HireFlow Generated Document', {
    x: leftMargin, y: 10, size: 8, font: regularFont, color: muted,
  });

  const pdfBytes = await doc.save();

  const offersDir = path.resolve(process.env.UPLOAD_DIR ?? './uploads', 'offers');
  fs.mkdirSync(offersDir, { recursive: true });
  const filename = `offer-${candidateId}-${Date.now()}.pdf`;
  const filePath = path.join(offersDir, filename);
  fs.writeFileSync(filePath, pdfBytes);

  return `offers/${filename}`;
}
