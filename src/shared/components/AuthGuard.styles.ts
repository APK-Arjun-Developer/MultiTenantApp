import type { StyleSheet } from '@/types';

export const styles = {
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
} as const satisfies StyleSheet;
