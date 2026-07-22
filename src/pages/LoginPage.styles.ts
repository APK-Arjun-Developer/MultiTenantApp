import { pageSmallIconBoxSx } from '@/shared/theme/styleHelpers';
import type { Sx } from '@/types';

const styles = {
  root: {
    overflow: 'hidden',
  },

  otpInputRow: {
    display: 'flex',
    gap: 1,
    justifyContent: 'center',
  },

  otpDigitBox: (filled: boolean) =>
    ({
      width: 48,
      height: 56,
      border: '2px solid',
      borderColor: filled ? 'primary.main' : 'divider',
      borderRadius: 1.5,
      transition: 'border-color 0.15s',
      '&.Mui-focused': { borderColor: 'primary.main' },
    }) as Sx,

  loginTitle: {
    fontWeight: 600,
    mb: 0.5,
  },

  loginSubtitle: {
    mb: 2,
  },

  loginFormBuilder: {
    boxShadow: 'none',
    p: 0,
    bgcolor: 'transparent',
  },

  loginSubmitButton: {
    mt: 1,
  },

  forgotPasswordLink: {
    textAlign: 'right',
    mt: 1,
  },

  forgotPasswordAnchor: {
    color: 'primary.main',
    textDecoration: 'none',
    '&:hover': { textDecoration: 'underline' },
  },

  verifyBackButton: {
    mb: 1,
    ml: -0.5,
  },

  verifyTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 0.5,
  },

  titleIconBox: pageSmallIconBoxSx,

  verifyTitleText: {
    fontWeight: 700,
  },

  verifySubtitle: {
    mb: 3,
  },

  verifyEmailHighlight: {
    fontWeight: 600,
    color: 'text.primary',
  },

  cooldownHighlight: {
    fontWeight: 600,
    color: 'text.primary',
  },

  resendBox: {
    textAlign: 'center',
  },
  verifyTitleIconSize: {
    fontSize: '0.875rem',
  },
} as const;

const otpInputStyle = {
  textAlign: 'center',
  fontSize: 22,
  fontWeight: 700,
  padding: 0,
} as const;

const stepTransition = { duration: 0.2, ease: 'easeOut' } as const;

export { otpInputStyle, stepTransition, styles };
