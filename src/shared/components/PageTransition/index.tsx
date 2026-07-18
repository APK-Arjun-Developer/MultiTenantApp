import React from 'react';
import { motion } from 'framer-motion';

import {
  motionDivStyle,
  pageTransitionAnimate,
  pageTransitionExit,
  pageTransitionInitial,
  pageTransitionTransition,
} from './styles';
import type { PageTransitionProps } from './types';

const PageTransition = React.memo(({ children, motionKey }: PageTransitionProps) => {
  return (
    <motion.div
      key={motionKey}
      initial={pageTransitionInitial}
      animate={pageTransitionAnimate}
      exit={pageTransitionExit}
      transition={pageTransitionTransition}
      style={motionDivStyle}
    >
      {children}
    </motion.div>
  );
});
export default PageTransition;
