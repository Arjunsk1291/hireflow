'use client';

import { motion } from 'framer-motion';

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  intensity?: number;
}

export function FloatingCard({ children, className, delay = 0, intensity = 5 }: FloatingCardProps) {
  const amplitude = intensity * 1.2;
  return (
    <motion.div
      className={className}
      animate={{
        y: [`0px`, `-${amplitude}px`, `0px`],
        rotateZ: ['0deg', '0.3deg', '0deg'],
      }}
      transition={{
        duration: 3.5 + delay * 0.4,
        ease: 'easeInOut',
        repeat: Infinity,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
