'use client';

import { StatCard } from '@/components/dashboard/StatCard';
import { Users, UserCheck, Award, TrendingUp } from 'lucide-react';

interface Props {
  totalCandidates: number;
  hired: number;
  offersData: number;
  conversionRate: number;
}

export function ReportsStats({ totalCandidates, hired, offersData, conversionRate }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard title="Total Candidates"  value={totalCandidates}  icon={Users}       trend={0} />
      <StatCard title="Hired"             value={hired}            icon={UserCheck}   trend={0} color="#22c55e" />
      <StatCard title="Offers Sent"       value={offersData}       icon={Award}       trend={0} color="#f59e0b" />
      <StatCard title="Conversion Rate"   value={conversionRate}   icon={TrendingUp}  trend={0} suffix="%" color="#3b82f6" />
    </div>
  );
}
