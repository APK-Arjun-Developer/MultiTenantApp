import type { SxProps, Theme } from '@mui/material/styles';
type Sx = SxProps<Theme>;

export const styles = {
  dialogTitle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as Sx,
  titleText: {
    fontWeight: 600,
  } as Sx,
  stack: {
    alignItems: 'center',
    py: 1,
  } as Sx,
  captionBox: {
    width: '100%',
  } as Sx,
  caption: {
    display: 'block',
    textAlign: 'center',
    mb: 2,
  } as Sx,
} as const;
