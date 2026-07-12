import type { SxProps, Theme } from '@mui/material/styles';
type Sx = SxProps<Theme>;

export const styles = {
  label: {
    mb: 0.25,
    display: 'block',
  } as Sx,
} as const;
