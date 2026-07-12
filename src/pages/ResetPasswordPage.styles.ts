import type { SxProps, Theme } from '@mui/material/styles';
type Sx = SxProps<Theme>;

export const styles = {
  invalidStack: {
    alignItems: 'center',
    textAlign: 'center',
  } as Sx,

  invalidIcon: {
    fontSize: 48,
    color: 'error.main',
  } as Sx,

  invalidTitle: {
    fontWeight: 600,
  } as Sx,

  invalidRequestButton: {
    mt: 1,
  } as Sx,

  successStack: {
    alignItems: 'center',
    textAlign: 'center',
  } as Sx,

  successIcon: {
    fontSize: 48,
    color: 'success.main',
  } as Sx,

  successTitle: {
    fontWeight: 600,
  } as Sx,

  successButton: {
    mt: 1,
  } as Sx,

  loadingBox: {
    display: 'flex',
    justifyContent: 'center',
    py: 4,
  } as Sx,

  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 0.5,
  } as Sx,

  titleText: {
    fontWeight: 600,
  } as Sx,

  emailSubtitle: {
    mb: 2,
  } as Sx,

  emailHighlight: {
    fontWeight: 600,
    color: 'text.primary',
  } as Sx,

  formBuilder: {
    boxShadow: 'none',
    p: 0,
    bgcolor: 'transparent',
  } as Sx,

  submitButton: {
    mt: 1,
  } as Sx,

  backLinkBox: {
    textAlign: 'center',
    mt: 1,
  } as Sx,
} as const;
