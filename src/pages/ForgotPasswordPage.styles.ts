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

  titleIconBox: {
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
  } as Sx,

  titleText: {
    fontWeight: 700,
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

  sentIconBox: {
    width: 64,
    height: 64,
    borderRadius: 3,
    background: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.06) 100%)',
    border: '1px solid rgba(34,197,94,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as Sx,

  sentIcon: {
    fontSize: '2rem',
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
