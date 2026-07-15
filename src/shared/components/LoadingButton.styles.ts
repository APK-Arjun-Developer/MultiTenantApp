import type { StyleSheet } from '@/types';

export const buttonRootStyle = { position: 'relative' as const };

export const styles = {
  spinnerVisible: {
    visibility: 'visible',
  },
  spinnerHidden: {
    visibility: 'hidden',
  },
  spinner: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    mt: '-8px',
    ml: '-8px',
  },
} as const satisfies StyleSheet;
