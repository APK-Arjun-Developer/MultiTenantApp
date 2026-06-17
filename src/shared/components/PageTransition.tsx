import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  motionKey?: string;
}

export function PageTransition({ children, motionKey }: PageTransitionProps) {
  return (
    <motion.div
      key={motionKey}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      {children}
    </motion.div>
  );
}
