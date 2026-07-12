import type { SxProps, Theme } from '@mui/material/styles';
type Sx = SxProps<Theme>;

export const styles = {
  spinnerVisible: {
    visibility: 'visible',
  } as Sx,
  spinnerHidden: {
    visibility: 'hidden',
  } as Sx,
  spinner: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    mt: '-8px',
    ml: '-8px',
  } as Sx,
} as const;
