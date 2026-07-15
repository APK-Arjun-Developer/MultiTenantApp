import type { StyleSheet } from '@/types';

export const styles = {
  root: {
    overflow: 'hidden',
  },

  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 0.5,
  },

  titleIconBox: {
    width: 28,
    height: 28,
    borderRadius: 1.25,
    background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    flexShrink: 0,
    boxShadow: '0 0 10px rgba(124,58,237,0.28)',
  },

  titleText: {
    fontWeight: 700,
  },

  subtitle: {
    mb: 2,
  },

  formBuilder: {
    boxShadow: 'none',
    p: 0,
    bgcolor: 'transparent',
  },

  submitButton: {
    mt: 1,
  },

  backLinkBox: {
    textAlign: 'center',
    mt: 1,
  },

  sentStack: {
    alignItems: 'center',
    textAlign: 'center',
  },

  sentIconBox: {
    width: 64,
    height: 64,
    borderRadius: 3,
    background: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.06) 100%)',
    border: '1px solid rgba(34,197,94,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sentIcon: {
    fontSize: '2rem',
    color: 'success.main',
  },

  sentTitle: {
    fontWeight: 600,
  },

  sentEmailHighlight: {
    fontWeight: 600,
    color: 'text.primary',
  },

  sentBackButton: {
    mt: 1,
  },
  titleIconSize: {
    fontSize: '0.875rem',
  },
} as const satisfies StyleSheet;
