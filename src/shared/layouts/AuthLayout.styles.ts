import { type Theme } from '@mui/material/styles';

import { themedIconBoxSx } from '@/shared/theme/styleHelpers';
import type { StyleSheet } from '@/types';

const styles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: 'background.default',
    px: 2,
  },

  logoContainer: {
    mb: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    mb: 0.5,
  },

  brandMark: (t: Theme) => ({
    ...themedIconBoxSx(32, 1.5, 14, 0.4)(t),
    fontWeight: 800,
    fontSize: '0.9375rem',
    letterSpacing: '-0.02em',
  }),

  title: {
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: 'text.primary',
  },

  subtitle: {
    mt: 0.25,
  },

  card: {
    width: '100%',
    maxWidth: 440,
  },

  cardContent: {
    p: 4,
  },

  pageLoader: {
    display: 'flex',
    justifyContent: 'center',
    py: 4,
  },
} as const satisfies StyleSheet;

export { styles };
