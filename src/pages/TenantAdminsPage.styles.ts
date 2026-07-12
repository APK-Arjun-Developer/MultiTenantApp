import type { SxProps, Theme } from '@mui/material/styles';

type Sx = SxProps<Theme>;

export const styles = {
  // ─── Page root ──────────────────────────────────────────────────────────────

  /** Outermost wrapper Box for the entire page */
  pageRoot: {} as Sx,

  // ─── Header section ──────────────────────────────────────────────────────────

  /** Row that holds the page title icon+text on the left and action buttons on the right */
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 3,
  } as Sx,

  /** Left side of the header: icon + title text */
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

  /** Typography variant for the page title */
  headerTitleText: {
    fontWeight: 700,
    letterSpacing: '-0.01em',
  } as Sx,

  /** Right side of the header: action buttons */
  headerActions: {
    display: 'flex',
    gap: 1,
  } as Sx,

  // ─── Tabs ────────────────────────────────────────────────────────────────────

  /** Tabs bar with bottom divider */
  tabs: {
    mb: 2,
    borderBottom: 1,
    borderColor: 'divider',
  } as Sx,

  // ─── Filter bar wrapper ───────────────────────────────────────────────────────

  /** Wrapper Box above each DataTable that holds a FilterForm */
  filterBarWrapper: {
    mb: 2,
  } as Sx,

  // ─── Empty / permission-denied state ─────────────────────────────────────────

  /** Centered placeholder shown when the user lacks list permission */
  permissionDenied: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    py: 10,
    textAlign: 'center',
    color: 'text.disabled',
  } as Sx,

  // ─── Admin column cells ───────────────────────────────────────────────────────

  /** Avatar in the first column — clickable to open avatar manager */
  adminAvatar: {
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

  /** Cell wrapper for the name + email stacked layout */
  adminNameCell: {} as Sx,

  /** Bold name text inside the Admin column */
  adminNameText: {
    fontWeight: 500,
  } as Sx,

  /** Bold tenant name text inside the Tenant column */
  tenantNameText: {
    fontWeight: 500,
  } as Sx,

  // ─── Action cells ─────────────────────────────────────────────────────────────

  /** Flex row that holds the icon-button actions at the end of each admin row */
  adminRowActions: {
    display: 'flex',
    gap: 0.5,
    justifyContent: 'flex-end',
  } as Sx,

  /** Flex row that holds the icon-button actions at the end of each invitation row */
  invitationRowActions: {
    display: 'flex',
    gap: 0.5,
    justifyContent: 'flex-end',
  } as Sx,

  // ─── View dialog ──────────────────────────────────────────────────────────────

  /** Column stack inside ViewAdminDialog */
  viewDialogContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  } as Sx,

  // ─── Edit dialog ──────────────────────────────────────────────────────────────

  /** Email LabelValue spacing inside EditAdminDialog */
  editDialogEmailLabel: {
    mb: 2,
  } as Sx,

  // ─── FormBuilder (shared across all dialogs) ──────────────────────────────────

  /** Remove default Paper shadow / padding / bg when FormBuilder sits inside a Dialog */
  formBuilderInDialog: {
    boxShadow: 'none',
    p: 0,
    bgcolor: 'transparent',
  } as Sx,
} as const;
