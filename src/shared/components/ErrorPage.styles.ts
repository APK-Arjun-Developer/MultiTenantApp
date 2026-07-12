import type { SxProps, Theme } from '@mui/material/styles';
type Sx = SxProps<Theme>;

export const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: 2,
    p: 3,
    textAlign: 'center',
  } as Sx,
  title: {
    fontWeight: 700,
  } as Sx,
  message: {
    maxWidth: 480,
  } as Sx,
} as const;
