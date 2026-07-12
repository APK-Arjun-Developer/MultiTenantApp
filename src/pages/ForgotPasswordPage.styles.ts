import type { SxProps, Theme } from '@mui/material/styles';
type Sx = SxProps<Theme>;

export const styles = {
  root: {
    overflow: 'hidden',
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

  subtitle: {
    mb: 2,
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

  sentStack: {
    alignItems: 'center',
    textAlign: 'center',
  } as Sx,

  sentIcon: {
    fontSize: 48,
    color: 'success.main',
  } as Sx,

  sentTitle: {
    fontWeight: 600,
  } as Sx,

  sentEmailHighlight: {
    fontWeight: 600,
    color: 'text.primary',
  } as Sx,

  sentBackButton: {
    mt: 1,
  } as Sx,
} as const;
