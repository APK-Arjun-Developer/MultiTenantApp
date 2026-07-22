import { pageIconBoxSx } from '@/shared/theme/styleHelpers';
import type { StyleSheet } from '@/types';

const styles = {
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

  pageIconBox: pageIconBoxSx,

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

export { styles };
