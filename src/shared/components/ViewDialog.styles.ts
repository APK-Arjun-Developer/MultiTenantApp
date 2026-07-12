import type { SxProps, Theme } from '@mui/material/styles';
type Sx = SxProps<Theme>;

export const styles = {
  dialogActions: {
    px: 3,
    pb: 2,
  } as Sx,
} as const;
