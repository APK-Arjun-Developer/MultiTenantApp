import type { SxProps, Theme } from '@mui/material/styles';

type Sx = SxProps<Theme>;

export const styles = {
  // Page root container
  root: {
    maxWidth: 680,
  } as Sx,

  // Page header row (icon + title)
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    mb: 3,
  } as Sx,

  // Page title text
  pageTitle: {
    fontWeight: 600,
  } as Sx,

  // FormBuilder card
  formCard: {
    boxShadow: 1,
  } as Sx,

  // Save button top margin
  saveButton: {
    mt: 1,
  } as Sx,

  // Loading spinner wrapper
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    py: 8,
  } as Sx,
} as const;
