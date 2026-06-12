'use client';

import { useRef } from 'react';
import { motion, useSpring } from 'framer-motion';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export function MagneticButton({ children, className, strength = 0.35 }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const springX = useSpring(0, { stiffness: 200, damping: 20 });
  const springY = useSpring(0, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left - rect.width  / 2) * strength;
    const y = (e.clientY - rect.top  - rect.height / 2) * strength;
    springX.set(x);
    springY.set(y);
  };

  const handleMouseLeave = () => { springX.set(0); springY.set(0); };

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}
