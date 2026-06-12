'use client';

import { motion } from 'framer-motion';
import { EASE, DURATION } from '@/lib/constants';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = 'up',
  distance = 48,
  once = true,
}: ScrollRevealProps) {
  const offsets = {
    up:    { y: distance, x: 0 },
    down:  { y: -distance, x: 0 },
    left:  { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offsets[direction], scale: 0.97, filter: 'blur(4px)' }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once, amount: 0.15 }}
      transition={{ duration: DURATION.slow, ease: EASE.outExpo, delay }}
    >
      {children}
    </motion.div>
  );
}
