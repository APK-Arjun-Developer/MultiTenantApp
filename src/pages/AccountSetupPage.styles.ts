import type { SxProps, Theme } from '@mui/material/styles';
type Sx = SxProps<Theme>;

export const styles = {
  invalidIconRoot: {
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

  invalidButton: {
    mt: 1,
  } as Sx,

  successIconRoot: {
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

  successEmailHighlight: {
    fontWeight: 600,
    color: 'text.primary',
  } as Sx,

  successButton: {
    mt: 1,
  } as Sx,

  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 2,
  } as Sx,

  headerTitle: {
    fontWeight: 600,
  } as Sx,

  headerSubtitle: {
    mb: 2,
  } as Sx,

  headerEmailHighlight: {
    fontWeight: 600,
    color: 'text.primary',
  } as Sx,

  loadingBox: {
    display: 'flex',
    justifyContent: 'center',
    py: 4,
  } as Sx,

  formBuilder: {
    boxShadow: 'none',
    p: 0,
    bgcolor: 'transparent',
  } as Sx,

  submitButton: {
    mt: 1,
  } as Sx,

  wizardActionsRow: {
    display: 'flex',
    gap: 1,
    mt: 1,
  } as Sx,

  wizardBackButton: {
    flex: 1,
  } as Sx,

  wizardNextButton: {
    flex: 1,
  } as Sx,
} as const;
