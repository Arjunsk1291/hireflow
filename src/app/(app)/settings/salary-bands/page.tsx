import { requireRole } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/layout/PageHeader';
import { ScrollReveal } from '@/components/animation/ScrollReveal';
import { formatCurrency } from '@/lib/utils';

export default async function SalaryBandsPage() {
  await requireRole(['hr_manager', 'master_admin']);

  const bands = await prisma.salaryBand.findMany({
    orderBy: [{ department: 'asc' }, { level: 'asc' }],
  });

  const byDept: Record<string, typeof bands> = {};
  for (const band of bands) {
    const key = band.department ?? 'General';
    if (!byDept[key]) byDept[key] = [];
    byDept[key].push(band);
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Salary Bands"
        subtitle={`${bands.length} bands configured`}
      />

      {Object.keys(byDept).length === 0 ? (
        <ScrollReveal>
          <div className="glass-card p-8 text-center text-slate-500">
            <p>No salary bands configured.</p>
            <p className="text-xs mt-2">Use the Excel import API to add salary bands.</p>
          </div>
        </ScrollReveal>
      ) : (
        Object.entries(byDept).map(([dept, deptBands]) => (
          <ScrollReveal key={dept} className="mb-6">
            <h2 className="font-display text-xs text-amber-400 mb-3">{dept.toUpperCase()}</h2>
            <div className="glass-card divide-y divide-white/8">
              {deptBands.map((band) => (
                <div key={band.id} className="grid grid-cols-5 gap-4 p-3 items-center text-sm">
                  <div>
                    <div className="font-medium text-slate-200">{band.level}</div>
                    <div className="text-xs text-slate-500">{band.roleTitle}</div>
                  </div>
                  <div className="text-slate-400 text-xs">Min: {formatCurrency(band.minSalary, band.currency)}</div>
                  <div className="text-amber-400 text-xs">Mid: {formatCurrency((band.minSalary + band.maxSalary) / 2, band.currency)}</div>
                  <div className="text-slate-400 text-xs">Max: {formatCurrency(band.maxSalary, band.currency)}</div>
                  <div className="text-xs text-slate-600">{band.currency}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        ))
      )}
    </div>
  );
}
