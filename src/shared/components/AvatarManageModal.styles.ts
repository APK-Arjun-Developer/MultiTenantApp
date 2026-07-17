import type { StyleSheet } from '@/types';

const styles = {
  dialogTitle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleText: {
    fontWeight: 600,
  },
  stack: {
    alignItems: 'center',
    py: 1,
  },
  captionBox: {
    width: '100%',
  },
  caption: {
    display: 'block',
    textAlign: 'center',
    mb: 2,
  },
} as const satisfies StyleSheet;

export { styles };
