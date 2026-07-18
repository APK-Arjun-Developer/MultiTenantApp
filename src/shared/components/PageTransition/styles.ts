const motionDivStyle = { flex: 1, display: 'flex', flexDirection: 'column' } as const;

const pageTransitionInitial = { opacity: 0, y: 8 } as const;
const pageTransitionAnimate = { opacity: 1, y: 0 } as const;
const pageTransitionExit = { opacity: 0, y: -8 } as const;
const pageTransitionTransition = { duration: 0.18, ease: 'easeOut' } as const;

export {
  motionDivStyle,
  pageTransitionAnimate,
  pageTransitionExit,
  pageTransitionInitial,
  pageTransitionTransition,
};
