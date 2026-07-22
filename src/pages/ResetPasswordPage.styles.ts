import { pageSmallIconBoxSx } from '@/shared/theme/styleHelpers';
import type { StyleSheet } from '@/types';

const styles = {
  invalidStack: {
    alignItems: 'center',
    textAlign: 'center',
  },

  invalidIconBox: {
    width: 64,
    height: 64,
    borderRadius: 3,
    background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.06) 100%)',
    border: '1px solid rgba(239,68,68,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  invalidIcon: {
    fontSize: '2rem',
    color: 'error.main',
  },

  invalidTitle: {
    fontWeight: 700,
  },

  invalidRequestButton: {
    mt: 1,
  },

  successStack: {
    alignItems: 'center',
    textAlign: 'center',
  },

  successIconBox: {
    width: 64,
    height: 64,
    borderRadius: 3,
    background: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.06) 100%)',
    border: '1px solid rgba(34,197,94,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  successIcon: {
    fontSize: '2rem',
    color: 'success.main',
  },

  successTitle: {
    fontWeight: 700,
  },

  successButton: {
    mt: 1,
  },

  loadingBox: {
    display: 'flex',
    justifyContent: 'center',
    py: 4,
  },

  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 0.5,
  },

  titleIconBox: pageSmallIconBoxSx,

  titleText: {
    fontWeight: 700,
  },

  emailSubtitle: {
    mb: 2,
  },

  emailHighlight: {
    fontWeight: 600,
    color: 'text.primary',
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
  titleIconSize: {
    fontSize: '0.875rem',
  },
} as const satisfies StyleSheet;

export { styles };
