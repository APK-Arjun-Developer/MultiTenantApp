import type { StyleSheet } from '@/types';

const styles = {
  root: {
    maxWidth: 800,
  },

  pageIntro: {
    mb: 3,
  },

  sectionCard: {
    p: 3,
    mb: 2,
    borderRadius: 2,
  },

  sectionTitle: {
    fontWeight: 600,
    mb: 2,
  },

  radioGroup: {
    gap: 0.5,
    mb: 1,
  },

  radioLabelRoot: {
    alignItems: 'flex-start',
    '& .MuiFormControlLabel-label': {
      pt: 0.75,
    },
  },

  radioDescription: {
    lineHeight: 1.4,
    display: 'block',
    mt: 0.25,
  },

  autocompleteWrapper: {
    mt: 2,
  },

  hintBox: {
    mt: 2,
    p: 2,
    borderRadius: 1,
    bgcolor: 'action.hover',
  },

  subjectField: {
    mb: 2,
  },

  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
    mt: 1,
    flexWrap: 'wrap' as const,
  },

  disclaimer: {
    flex: 1,
  },

  sendButton: {
    px: 4,
    fontWeight: 600,
    minWidth: 140,
  },
} as const satisfies StyleSheet;

export { styles };
