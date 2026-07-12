import type { SxProps, Theme } from '@mui/material/styles';
type Sx = SxProps<Theme>;

export const styles = {
  paper: {
    overflow: 'hidden',
  } as Sx,

  headerCell: {} as Sx,

  centeredCell: {
    textAlign: 'center',
    py: 8,
    border: 0,
  } as Sx,

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
  } as Sx,

  emptyIcon: {
    fontSize: '2.25rem',
    color: 'text.disabled',
    opacity: 0.5,
  } as Sx,

  paginationContainer: {
    borderTop: 1,
    borderColor: 'divider',
  } as Sx,
} as const;
