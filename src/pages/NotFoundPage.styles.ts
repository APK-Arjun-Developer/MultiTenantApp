import type { SxProps, Theme } from '@mui/material/styles';
type Sx = SxProps<Theme>;

export const styles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    bgcolor: 'background.default',
  } as Sx,

  heading: {
    fontWeight: 700,
    color: 'primary.main',
    fontSize: { xs: '5rem', sm: '8rem' },
  } as Sx,

  goButton: {
    mt: 2,
  } as Sx,
} as const;
