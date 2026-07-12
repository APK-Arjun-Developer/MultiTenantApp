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
  pageIconBox: {
    width: 32,
    height: 32,
    borderRadius: 1.5,
    background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    flexShrink: 0,
    boxShadow: '0 0 12px rgba(124,58,237,0.3)',
  } as Sx,
  titleText: {
    fontWeight: 700,
    letterSpacing: '-0.01em',
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
