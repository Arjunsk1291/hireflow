'use client';

import { StatCard } from '@/components/dashboard/StatCard';
import { ScrollReveal } from '@/components/animation/ScrollReveal';
import { Users, Clock, CheckSquare, Award } from 'lucide-react';

interface Props {
  totalCandidates: number;
  pendingReviews: number;
  pendingApprovals: number;
  hired: number;
}

export function DashboardStats({ totalCandidates, pendingReviews, pendingApprovals, hired }: Props) {
  return (
    <ScrollReveal className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard title="Total Candidates"  value={totalCandidates}  icon={Users}        color="#6e63f0" />
      <StatCard title="Pending Reviews"   value={pendingReviews}   icon={Clock}        color="#60a5fa" />
      <StatCard title="Pending Approvals" value={pendingApprovals} icon={CheckSquare}  color="#c084fc" />
      <StatCard title="Hired This Cycle"  value={hired}            icon={Award}        color="#4ade80" />
    </ScrollReveal>
  );
}
