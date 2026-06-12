import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { read, utils } from 'xlsx';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userRoles = ((session.user as Record<string, unknown>).roles as string[]) ?? [];
  if (!userRoles.includes('master') && !userRoles.includes('hr_admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const workbook = read(Buffer.from(bytes), { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = utils.sheet_to_json<Record<string, unknown>>(sheet);

  let imported = 0;
  let errors = 0;

  for (const row of rows) {
    try {
      await prisma.salaryBand.upsert({
        where: {
          roleTitle_level_department_effectiveFrom: {
            roleTitle:     String(row['Role Title'] ?? row['roleTitle'] ?? ''),
            level:         String(row['Level'] ?? row['level'] ?? ''),
            department:    String(row['Department'] ?? row['department'] ?? ''),
            effectiveFrom: new Date(String(row['Effective From'] ?? row['effectiveFrom'] ?? new Date())),
          },
        },
        update: {
          minSalary: Number(row['Min Salary'] ?? row['minSalary'] ?? 0),
          maxSalary: Number(row['Max Salary'] ?? row['maxSalary'] ?? 0),
          currency:  String(row['Currency'] ?? row['currency'] ?? 'USD'),
          location:  String(row['Location'] ?? row['location'] ?? ''),
        },
        create: {
          roleTitle:     String(row['Role Title'] ?? row['roleTitle'] ?? ''),
          level:         String(row['Level'] ?? row['level'] ?? ''),
          department:    String(row['Department'] ?? row['department'] ?? ''),
          minSalary:     Number(row['Min Salary'] ?? row['minSalary'] ?? 0),
          maxSalary:     Number(row['Max Salary'] ?? row['maxSalary'] ?? 0),
          currency:      String(row['Currency'] ?? row['currency'] ?? 'USD'),
          location:      String(row['Location'] ?? row['location'] ?? ''),
          effectiveFrom: new Date(String(row['Effective From'] ?? row['effectiveFrom'] ?? new Date())),
          createdById:   session.user.id,
        },
      });
      imported++;
    } catch {
      errors++;
    }
  }

  return NextResponse.json({ imported, errors, total: rows.length });
}
