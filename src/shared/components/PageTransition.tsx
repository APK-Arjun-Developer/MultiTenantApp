import React from 'react';
import { motion } from 'framer-motion';
import type { PageTransitionProps } from './PageTransition.types';
import { motionDivStyle } from './PageTransition.styles';

export const PageTransition = React.memo(function PageTransition({
  children,
  motionKey,
}: PageTransitionProps) {
  return (
    <motion.div
      key={motionKey}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={motionDivStyle}
    >
      {children}
    </motion.div>
  );
});
