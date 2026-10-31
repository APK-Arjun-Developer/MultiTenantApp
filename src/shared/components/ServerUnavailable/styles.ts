import type { StyleSheet } from '@/types';

const styles = {
  root: {
    alignItems: 'center',
    textAlign: 'center',
  },

  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 3,
    background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.06) 100%)',
    border: '1px solid rgba(239,68,68,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    fontSize: '2rem',
    color: 'error.main',
  },

  title: {
    fontWeight: 700,
  },

  button: {
    mt: 1,
  },
} as const satisfies StyleSheet;

export { styles };
