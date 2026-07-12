import type { SxProps, Theme } from '@mui/material/styles';

type Sx = SxProps<Theme>;

export const styles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: 'background.default',
    px: 2,
  } as Sx,

  logoContainer: {
    mb: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  } as Sx,

  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    mb: 0.5,
  } as Sx,

  brandMark: {
    width: 32,
    height: 32,
    borderRadius: 1.5,
    background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 800,
    fontSize: '0.9375rem',
    letterSpacing: '-0.02em',
    flexShrink: 0,
    boxShadow: '0 0 14px rgba(124,58,237,0.4)',
  } as Sx,

  title: {
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: 'text.primary',
  } as Sx,

  subtitle: {
    mt: 0.25,
  } as Sx,

  card: {
    width: '100%',
    maxWidth: 440,
  } as Sx,

  cardContent: {
    p: 4,
  } as Sx,

  pageLoader: {
    display: 'flex',
    justifyContent: 'center',
    py: 4,
  } as Sx,
} as const;
