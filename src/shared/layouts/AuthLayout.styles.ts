import type { StyleSheet } from '@/types';

export const styles = {
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

  brandMark: {
    width: 32,
    height: 32,
    borderRadius: 1.5,
    background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 800,
    fontSize: '0.9375rem',
    letterSpacing: '-0.02em',
    flexShrink: 0,
    boxShadow: '0 0 14px rgba(124,58,237,0.4)',
  },

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
