import type { StyleSheet } from '@/types';

const styles = {
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },

  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: 1.5,
    p: 4,
    textAlign: 'center',
    bgcolor: 'background.default',
  },

  errorIcon: {
    fontSize: '3rem',
    color: 'error.main',
    opacity: 0.85,
  },

  errorTitle: {
    fontWeight: 700,
  },

  errorMessage: {
    maxWidth: 420,
    color: 'text.secondary',
  },
} as const satisfies StyleSheet;

export { styles };
