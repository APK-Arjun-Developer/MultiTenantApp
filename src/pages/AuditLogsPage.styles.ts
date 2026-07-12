import type { SxProps, Theme } from '@mui/material/styles';

type Sx = SxProps<Theme>;

export const styles = {
  root: {} as Sx,
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 3,
  } as Sx,
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
  } as Sx,
  titleText: {
    fontWeight: 600,
  } as Sx,
  filterBar: {
    mb: 2,
  } as Sx,
  timeCell: {
    whiteSpace: 'nowrap',
  } as Sx,
  actionCell: {
    fontWeight: 500,
  } as Sx,
  descriptionCell: {
    maxWidth: 360,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as Sx,
} as const;
