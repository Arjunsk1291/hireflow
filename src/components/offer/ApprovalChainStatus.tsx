'use client';

import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react';
import { EASE } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import type { OfferApproval } from '@/types';

const STEP_LABELS: Record<string, string> = {
  panel_lead: 'Panel Lead',
  hr_admin: 'HR Admin',
  svp: 'SVP',
  finance_approver: 'Finance',
  master: 'Master Admin',
};

export function ApprovalChainStatus({ approvals }: { approvals: (OfferApproval & { approver?: { fullName: string } | null })[] }) {
  const sorted = [...approvals].sort((a, b) => a.stepOrder - b.stepOrder);
  const currentStep = sorted.find((s) => s.status === 'pending')?.stepOrder ?? 0;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {sorted.map((step, index) => (
        <div key={step.id} className="flex items-center gap-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.12, ...EASE.spring }}
            className="relative"
          >
            <div
              className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                step.status === 'approved'
                  ? 'border-green-500/40 bg-green-500/10 text-green-400'
                  : step.status === 'rejected'
                  ? 'border-red-500/40 bg-red-500/10 text-red-400'
                  : step.stepOrder === currentStep
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                  : 'border-white/8 bg-white/4 text-slate-500'
              }`}
            >
              {step.status === 'approved' && (
                <motion.div
                  className="absolute inset-0 bg-green-500/10 rounded-lg"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  style={{ transformOrigin: 'left center' }}
                  transition={{ duration: 0.5, ease: EASE.outExpo }}
                />
              )}
              {step.status === 'pending' && step.stepOrder === currentStep && (
                <motion.div
                  className="absolute inset-0 rounded-lg border border-amber-500"
                  animate={{ scale: [1, 1.05, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {step.status === 'approved' ? <CheckCircle size={12} /> :
                 step.status === 'rejected' ? <XCircle size={12} /> :
                 <Clock size={12} />}
                {STEP_LABELS[step.step] ?? step.step}
              </span>
              {step.approver && (
                <span className="relative z-10 text-[10px] opacity-70">{step.approver.fullName}</span>
              )}
              {step.decidedAt && (
                <span className="relative z-10 text-[10px] opacity-50">{formatDate(step.decidedAt, 'MMM d')}</span>
              )}
            </div>
          </motion.div>

          {index < sorted.length - 1 && (
            <ChevronRight size={14} className="text-slate-600 shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}
