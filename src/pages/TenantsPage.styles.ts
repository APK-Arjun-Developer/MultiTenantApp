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

  headerTitleText: {
    fontWeight: 600,
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
    textAlign: 'center',
    py: 6,
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
    width: 36,
    height: 36,
    cursor: 'pointer',
    fontSize: 14,
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
