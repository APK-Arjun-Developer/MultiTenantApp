import type { StyleSheet } from '@/types';

const styles = {
  root: {
    display: 'flex',
    gap: 1,
    mt: 1,
  },
  button: {
    flex: 1,
  },
} as const satisfies StyleSheet;

export { styles };
