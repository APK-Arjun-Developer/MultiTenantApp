import React from 'react';
import { motion } from 'framer-motion';

import { motionDivStyle } from './PageTransition.styles';
import type { PageTransitionProps } from './PageTransition.types';

const PageTransition = React.memo(({ children, motionKey }: PageTransitionProps) => {
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
export default PageTransition;
