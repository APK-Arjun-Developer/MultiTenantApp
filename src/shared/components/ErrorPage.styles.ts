import type { SxProps, Theme } from '@mui/material/styles';
type Sx = SxProps<Theme>;

export const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: 1.5,
    p: 4,
    textAlign: 'center',
    bgcolor: 'background.default',
  } as Sx,

  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 3,
    background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.06) 100%)',
    border: '1px solid rgba(239,68,68,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    mb: 1,
  } as Sx,

  icon: {
    fontSize: '2.25rem',
    color: 'error.main',
    opacity: 0.85,
  } as Sx,

  title: {
    fontWeight: 700,
    letterSpacing: '-0.02em',
  } as Sx,

  message: {
    maxWidth: 440,
    color: 'text.secondary',
    mt: 0.5,
  } as Sx,

  button: {
    mt: 1,
  } as Sx,
} as const;
