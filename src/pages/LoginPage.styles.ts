import type { SxProps, Theme } from '@mui/material/styles';
type Sx = SxProps<Theme>;

export const styles = {
  root: {
    overflow: 'hidden',
  } as Sx,

  otpInputRow: {
    display: 'flex',
    gap: 1,
    justifyContent: 'center',
  } as Sx,

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
  } as Sx,

  loginSubtitle: {
    mb: 2,
  } as Sx,

  loginFormBuilder: {
    boxShadow: 'none',
    p: 0,
    bgcolor: 'transparent',
  } as Sx,

  loginSubmitButton: {
    mt: 1,
  } as Sx,

  forgotPasswordLink: {
    textAlign: 'right',
    mt: 1,
  } as Sx,

  forgotPasswordAnchor: {
    color: 'primary.main',
    textDecoration: 'none',
    '&:hover': { textDecoration: 'underline' },
  } as Sx,

  verifyBackButton: {
    mb: 1,
    ml: -0.5,
  } as Sx,

  verifyTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 0.5,
  } as Sx,

  verifyTitleText: {
    fontWeight: 600,
  } as Sx,

  verifySubtitle: {
    mb: 3,
  } as Sx,

  verifyEmailHighlight: {
    fontWeight: 600,
    color: 'text.primary',
  } as Sx,

  cooldownHighlight: {
    fontWeight: 600,
    color: 'text.primary',
  } as Sx,

  resendBox: {
    textAlign: 'center',
  } as Sx,
} as const;
