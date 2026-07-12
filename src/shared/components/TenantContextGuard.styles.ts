import type { SxProps, Theme } from '@mui/material/styles';
type Sx = SxProps<Theme>;

export const styles = {
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    py: 10,
    gap: 2,
    color: 'text.secondary',
  } as Sx,
  icon: {
    fontSize: 56,
    opacity: 0.3,
  } as Sx,
  heading: {
    fontWeight: 600,
  } as Sx,
  body: {
    textAlign: 'center',
    maxWidth: 340,
  } as Sx,
} as const;
