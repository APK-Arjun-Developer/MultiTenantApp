import type { StyleSheet } from '@/types';

const styles = {
  root: {},

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
    p: 2,
    borderRadius: 1,
    bgcolor: 'action.hover',
  },

  formBuilder: {
    boxShadow: 'none',
    p: 0,
    bgcolor: 'transparent',
  },

  selectOption: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    py: 0.25,
  },

  optionAvatar: {
    width: 32,
    height: 32,
    fontSize: '0.75rem',
  },

  optionName: {
    fontWeight: 500,
    lineHeight: 1.3,
  },

  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
    mt: 2,
    flexWrap: 'wrap' as const,
  },

  disclaimer: {
    flex: 1,
    color: 'text.secondary',
  },

  sendButton: {
    px: 4,
    fontWeight: 600,
    minWidth: 140,
  },
} as const satisfies StyleSheet;

export { styles };
