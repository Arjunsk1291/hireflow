'use client';

import { motion } from 'framer-motion';

interface DrawLineProps {
  className?: string;
  orientation?: 'vertical' | 'horizontal';
  color?: string;
  thickness?: number;
  length?: string;
}

export function DrawLine({
  className,
  orientation = 'vertical',
  color = '#f59e0b',
  thickness = 2,
  length = '100%',
}: DrawLineProps) {
  const isV = orientation === 'vertical';
  return (
    <motion.div
      className={className}
      initial={{ [isV ? 'scaleY' : 'scaleX']: 0, opacity: 0 }}
      whileInView={{ [isV ? 'scaleY' : 'scaleX']: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        transformOrigin: isV ? 'top center' : 'left center',
        width:  isV ? `${thickness}px` : length,
        height: isV ? length : `${thickness}px`,
        background: `linear-gradient(${isV ? '180deg' : '90deg'}, transparent 0%, ${color} 20%, ${color} 80%, transparent 100%)`,
      }}
    />
  );
}
