import type { SxProps, Theme } from '@mui/material/styles';

type Sx = SxProps<Theme>;

export const styles = {
  root: {} as Sx,
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 2,
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
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    py: 10,
    textAlign: 'center',
    color: 'text.disabled',
  } as Sx,
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
  } as Sx,
  permissionChip: {
    mr: 0.5,
    mb: 0.5,
  } as Sx,
  actionButtons: {
    display: 'flex',
    gap: 0.5,
  } as Sx,
  viewDialogContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  } as Sx,
  formBuilder: {
    boxShadow: 'none',
    p: 0,
    bgcolor: 'transparent',
  } as Sx,
  columnName: {
    fontWeight: 500,
  } as Sx,
} as const;
