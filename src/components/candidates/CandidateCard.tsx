'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, Clock, ChevronRight } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { StatusBadge } from './StatusBadge';
import { timeAgo } from '@/lib/utils';
import type { CandidateWithRelations } from '@/types';

export function CandidateCard({ candidate }: { candidate: CandidateWithRelations }) {
  return (
    <motion.div
      className="glass-card p-4 cursor-pointer"
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Link href={`/candidates/${candidate.id}`} className="block">
        <div className="flex items-start gap-3">
          <Avatar name={candidate.fullName} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-sm text-slate-100 truncate">{candidate.fullName}</h3>
              <ChevronRight size={14} className="text-slate-600 shrink-0 mt-0.5" />
            </div>
            <p className="text-xs text-violet-400/80 mt-0.5 truncate">{candidate.appliedRoleTitle}</p>

            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
              {candidate.currentEmployer && (
                <span className="flex items-center gap-1">
                  <Briefcase size={11} />
                  {candidate.currentEmployer}
                </span>
              )}
              {candidate.currentLocation && (
                <span className="flex items-center gap-1">
                  <MapPin size={11} />
                  {candidate.currentLocation}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between mt-3">
              <StatusBadge status={candidate.status} />
              <span className="flex items-center gap-1 text-[10px] text-slate-600">
                <Clock size={10} />
                {timeAgo(candidate.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
