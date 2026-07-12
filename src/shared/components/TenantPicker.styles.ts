import type { SxProps, Theme } from '@mui/material/styles';
type Sx = SxProps<Theme>;

export const styles = {
  formControl: {
    minWidth: 180,
    maxWidth: 260,
  } as Sx,

  select: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    borderRadius: '6px !important',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'divider',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'text.disabled',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'primary.main',
      borderWidth: '1.5px',
    },
  } as Sx,

  renderValueBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    py: 0.125,
  } as Sx,

  renderValueDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    bgcolor: 'primary.light',
    flexShrink: 0,
  } as Sx,

  renderValueText: {
    fontWeight: 500,
    fontSize: '0.8125rem',
    color: 'text.primary',
  } as Sx,

  platformMenuItem: {
    fontStyle: 'italic',
    color: 'text.secondary',
  } as Sx,

  tenantMenuItemText: {
    fontWeight: 500,
    fontSize: '0.875rem',
  } as Sx,

  loadingSpinner: {
    mx: 1,
    color: 'text.secondary',
  } as Sx,
} as const;
