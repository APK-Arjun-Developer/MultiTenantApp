import type { SxProps, Theme } from '@mui/material/styles';

type Sx = SxProps<Theme>;

export const styles = {
  /** Outer page wrapper */
  root: {} as Sx,

  /** Top header row: title left, action buttons right */
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 2,
  } as Sx,

  /** Left side of header: icon + title */
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
  } as Sx,

  /** Right side of header: Create / Invite buttons */
  headerActions: {
    display: 'flex',
    gap: 1,
  } as Sx,

  /** Page title text */
  titleText: {
    fontWeight: 600,
  } as Sx,

  /** Plan-limit warning alert */
  limitAlert: {
    mb: 2,
  } as Sx,

  /** Tabs row */
  tabsRow: {
    mb: 2,
  } as Sx,

  /** "No permission" empty-state box */
  noPermission: {
    textAlign: 'center',
    py: 6,
  } as Sx,

  /** Wrapper around the filter bar + export row for the Users tab */
  filterBar: {
    mb: 2,
  } as Sx,

  /** Export CSV button row — aligns button to the right */
  exportRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    mt: 1,
  } as Sx,

  /** Wrapper around the invitations filter bar */
  invitationsFilterBar: {
    mb: 2,
  } as Sx,

  /** Actions cell in the users table */
  actionsCell: {
    display: 'flex',
    gap: 0.5,
  } as Sx,

  /** Actions cell in the invitations table (same layout) */
  invitationActionsCell: {
    display: 'flex',
    gap: 0.5,
  } as Sx,

  /** User cell: stacks full name above email */
  userCell: {} as Sx,

  /** Full name text inside user cell */
  userCellName: {
    fontWeight: 500,
  } as Sx,

  /** Last-login cell — prevents line-wrap */
  lastLoginCell: {
    whiteSpace: 'nowrap',
  } as Sx,

  /** Role chip in the ViewUserDialog chip row */
  roleChip: {
    mr: 0.5,
    mb: 0.5,
  } as Sx,

  /** Column of label/value pairs inside ViewUserDialog */
  viewDialogBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  } as Sx,

  /** Avatar (clickable) in the users table */
  avatarClickable: {
    width: 36,
    height: 36,
    cursor: 'pointer',
    fontSize: '0.875rem',
  } as Sx,

  /** Avatar (read-only) in the users table */
  avatarReadOnly: {
    width: 36,
    height: 36,
    fontSize: '0.875rem',
  } as Sx,

  /** FormBuilder inside dialogs — removes card chrome */
  dialogForm: {
    boxShadow: 'none',
    p: 0,
    bgcolor: 'transparent',
  } as Sx,

  /** Email label/value inside EditUserDialog, above the form */
  editDialogEmail: {
    mb: 2,
  } as Sx,
} as const;
