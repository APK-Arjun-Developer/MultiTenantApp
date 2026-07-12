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
  titleText: {
    fontWeight: 600,
  } as Sx,
  filterBar: {
    mb: 2,
  } as Sx,
  emptyState: {
    textAlign: 'center',
    py: 6,
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
