import type { SxProps, Theme } from '@mui/material/styles';
type Sx = SxProps<Theme>;

export const styles = {
  headerCell: {
    fontWeight: 600,
    bgcolor: 'background.default',
    whiteSpace: 'nowrap',
  } as Sx,
  centeredCell: {
    textAlign: 'center',
    py: 5,
  } as Sx,
  paginationContainer: {
    borderTop: 1,
    borderColor: 'divider',
  } as Sx,
} as const;
