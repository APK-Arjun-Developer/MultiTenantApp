import type { StyleSheet } from '@/types';

const styles = {
  alert: {
    width: '100%',
    minWidth: 280,
    color: '#fff',
    '& .MuiAlert-icon': { color: '#fff' },
  },
} as const satisfies StyleSheet;

export { styles };
