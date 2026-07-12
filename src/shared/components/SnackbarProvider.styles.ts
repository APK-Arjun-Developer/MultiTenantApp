import type { SxProps, Theme } from '@mui/material/styles';
type Sx = SxProps<Theme>;

export const styles = {
  alert: {
    width: '100%',
    minWidth: 280,
  } as Sx,
} as const;
