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

  /** Gradient icon box for page header (matches dashboard brandMark style) */
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

  /** Right side of header: Create / Invite buttons */
  headerActions: {
    display: 'flex',
    gap: 1,
  } as Sx,

  /** Page title text */
  titleText: {
    fontWeight: 700,
    letterSpacing: '-0.01em',
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    py: 10,
    textAlign: 'center',
    color: 'text.disabled',
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

  /** Avatar (clickable) in the users table — violet border signals interactivity */
  avatarClickable: {
    width: 34,
    height: 34,
    cursor: 'pointer',
    fontSize: '0.8125rem',
    bgcolor: 'primary.dark',
    border: '1.5px solid',
    borderColor: 'primary.light',
    boxSizing: 'border-box',
    transition: 'box-shadow 0.15s ease',
    '&:hover': {
      boxShadow: '0 0 0 2px rgba(124,58,237,0.35)',
    },
  } as Sx,

  /** Avatar (read-only) in the users table */
  avatarReadOnly: {
    width: 34,
    height: 34,
    fontSize: '0.8125rem',
    bgcolor: 'action.selected',
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
