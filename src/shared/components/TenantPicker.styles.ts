import type { SxProps, Theme } from '@mui/material/styles';
type Sx = SxProps<Theme>;

export const styles = {
  formControl: {
    minWidth: 200,
  } as Sx,
  select: {
    fontSize: 14,
    '.MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
    bgcolor: 'background.default',
  } as Sx,
  renderValueBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
  } as Sx,
  renderValueText: {
    fontWeight: 500,
  } as Sx,
  platformMenuItem: {
    fontStyle: 'italic',
  } as Sx,
  tenantMenuItemText: {
    fontWeight: 500,
  } as Sx,
  loadingSpinner: {
    mx: 1,
  } as Sx,
} as const;
