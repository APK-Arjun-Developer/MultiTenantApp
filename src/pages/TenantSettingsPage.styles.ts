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

  // Page title text
  pageTitle: {
    fontWeight: 700,
    letterSpacing: '-0.01em',
  } as Sx,

  // FormBuilder card
  formCard: {} as Sx,

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
