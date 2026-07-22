import { type Theme } from '@mui/material/styles';

import type { StyleSheet } from '@/types';

const styles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1.5,
    bgcolor: 'background.default',
    textAlign: 'center',
    p: 4,
  },

  heading: (t: Theme) => ({
    fontWeight: 800,
    fontSize: { xs: '5rem', sm: '8rem' },
    letterSpacing: '-0.04em',
    lineHeight: 1,
    background: `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.secondary.main} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  }),

  subtitle: {
    fontWeight: 600,
    letterSpacing: '-0.01em',
    mt: 0.5,
  },

  goButton: {
    mt: 2,
  },
} as const satisfies StyleSheet;

export { styles };
