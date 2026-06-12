'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 1.2, filter: 'blur(4px)' }}
        transition={{ duration: 0.25 }}
      >
        <Badge status={status} className={className} />
      </motion.div>
    </AnimatePresence>
  );
}
