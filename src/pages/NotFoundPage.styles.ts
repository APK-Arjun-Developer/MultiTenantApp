import type { SxProps, Theme } from '@mui/material/styles';
type Sx = SxProps<Theme>;

export const styles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1.5,
    bgcolor: 'background.default',
    textAlign: 'center',
    p: 4,
  } as Sx,

  heading: {
    fontWeight: 800,
    fontSize: { xs: '5rem', sm: '8rem' },
    letterSpacing: '-0.04em',
    lineHeight: 1,
    background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  } as Sx,

  subtitle: {
    fontWeight: 600,
    letterSpacing: '-0.01em',
    mt: 0.5,
  } as Sx,

  goButton: {
    mt: 2,
  } as Sx,
} as const;
