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

  headerTitleText: {
    fontWeight: 700,
    letterSpacing: '-0.01em',
  } as Sx,

  headerActions: {
    display: 'flex',
    gap: 1,
  } as Sx,

  tabsRow: {
    mb: 2,
    borderBottom: 1,
    borderColor: 'divider',
  } as Sx,

  emptyPermission: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    py: 10,
    textAlign: 'center',
    color: 'text.disabled',
  } as Sx,

  filterBar: {
    mb: 2,
  } as Sx,

  actionsCell: {
    display: 'flex',
    gap: 0.5,
    justifyContent: 'flex-end',
  } as Sx,

  avatarLogo: {
    width: 34,
    height: 34,
    cursor: 'pointer',
    fontSize: '0.8125rem',
    borderRadius: 1.5,
    bgcolor: 'action.selected',
    border: '1.5px solid',
    borderColor: 'divider',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease',
    '&:hover': {
      borderColor: 'primary.light',
    },
  } as Sx,

  viewDialogContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  } as Sx,

  wizardActions: {
    display: 'flex',
    gap: 1,
    mt: 1,
  } as Sx,

  wizardActionFlex: {
    flex: 1,
  } as Sx,

  formInDialog: {
    boxShadow: 'none',
    p: 0,
    bgcolor: 'transparent',
  } as Sx,

  formInDialogWithTopMargin: {
    boxShadow: 'none',
    p: 0,
    bgcolor: 'transparent',
    mt: 1,
  } as Sx,

  tenantNameCell: {
    fontWeight: 500,
  } as Sx,
} as const;
