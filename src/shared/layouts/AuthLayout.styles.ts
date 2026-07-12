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
    textAlign: 'center',
  } as Sx,

  title: {
    fontWeight: 700,
    color: 'primary.main',
  } as Sx,

  subtitle: {
    mt: 0.5,
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
