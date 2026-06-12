'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)',
          transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }}
        exit={{ opacity: 0, y: -10, filter: 'blur(4px)',
          transition: { duration: 0.2 } }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
