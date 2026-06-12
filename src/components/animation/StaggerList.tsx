'use client';

import { motion } from 'framer-motion';
import { EASE, DURATION } from '@/lib/constants';

interface StaggerListProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
  itemClassName?: string;
}

const containerVariants = (stagger: number) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: 0.1 } },
});

const itemVariants = {
  hidden:  { opacity: 0, y: 56, scale: 0.95, filter: 'blur(6px)' },
  visible: {
    opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
    transition: { duration: DURATION.slow, ease: EASE.outExpo },
  },
};

export function StaggerList({ children, className, staggerDelay = 0.08, itemClassName }: StaggerListProps) {
  return (
    <motion.div
      className={className}
      variants={containerVariants(staggerDelay)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      {children.map((child, i) => (
        <motion.div key={i} variants={itemVariants} className={itemClassName}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
