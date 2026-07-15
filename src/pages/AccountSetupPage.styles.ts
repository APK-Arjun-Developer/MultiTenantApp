import type { StyleSheet } from '@/types';

export const styles = {
  invalidIconRoot: {
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

  invalidButton: {
    mt: 1,
  },

  successIconRoot: {
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

  successEmailHighlight: {
    fontWeight: 600,
    color: 'text.primary',
  },

  successButton: {
    mt: 1,
  },

  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 2,
  },

  headerIconBox: {
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

  headerTitle: {
    fontWeight: 700,
  },

  headerSubtitle: {
    mb: 2,
  },

  headerEmailHighlight: {
    fontWeight: 600,
    color: 'text.primary',
  },

  loadingBox: {
    display: 'flex',
    justifyContent: 'center',
    py: 4,
  },

  formBuilder: {
    boxShadow: 'none',
    p: 0,
    bgcolor: 'transparent',
  },

  submitButton: {
    mt: 1,
  },

  wizardActionsRow: {
    display: 'flex',
    gap: 1,
    mt: 1,
  },

  wizardBackButton: {
    flex: 1,
  },

  wizardNextButton: {
    flex: 1,
  },
  headerIconSize: {
    fontSize: '0.875rem',
  },
} as const satisfies StyleSheet;
