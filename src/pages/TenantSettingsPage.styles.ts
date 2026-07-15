import type { StyleSheet } from '@/types';

export const styles = {
  // Page root container
  root: {
    maxWidth: 680,
  },

  // Page header row (icon + title)
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    mb: 3,
  },

  pageIconBox: {
    width: 32,
    height: 32,
    borderRadius: 1.5,
    background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    flexShrink: 0,
    boxShadow: '0 0 12px rgba(124,58,237,0.3)',
  },

  // Page title text
  pageTitle: {
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },

  // FormBuilder card
  formCard: {},

  // Save button top margin
  saveButton: {
    mt: 1,
  },

  // Loading spinner wrapper
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    py: 8,
  },
  pageIconSize: {
    fontSize: '1.125rem',
  },
} as const satisfies StyleSheet;
