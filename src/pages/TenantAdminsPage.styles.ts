import { headerTitleSx, pageIconBoxSx } from '@/shared/theme/styleHelpers';
import type { StyleSheet } from '@/types';

const styles = {
  /** Outermost wrapper Box for the entire page */
  pageRoot: {},

  /** Row that holds the page title icon+text on the left and action buttons on the right */
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 3,
  },

  /** Left side of the header: icon + title text */
  headerTitle: headerTitleSx,

  pageIconBox: pageIconBoxSx,

  /** Typography variant for the page title */
  headerTitleText: {
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },

  /** Right side of the header: action buttons */
  headerActions: {
    display: 'flex',
    gap: 1,
  },

  /** Tabs bar with bottom divider */
  tabs: {
    mb: 2,
    borderBottom: 1,
    borderColor: 'divider',
  },

  /** Wrapper Box above each DataTable that holds a FilterForm */
  filterBarWrapper: {
    mb: 2,
  },

  /** Centered placeholder shown when the user lacks list permission */
  permissionDenied: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    py: 10,
    textAlign: 'center',
    color: 'text.disabled',
  },

  adminAvatar: {
    width: 34,
    height: 34,
    cursor: 'pointer',
    fontSize: '0.8125rem',
    bgcolor: 'primary.dark',
  },

  /** Cell wrapper for the name + email stacked layout */
  adminNameCell: {},

  /** Bold name text inside the Admin column */
  adminNameText: {
    fontWeight: 500,
  },

  /** Bold tenant name text inside the Tenant column */
  tenantNameText: {
    fontWeight: 500,
  },

  /** Flex row that holds the icon-button actions at the end of each admin row */
  adminRowActions: {
    display: 'flex',
    gap: 0.5,
    justifyContent: 'flex-end',
  },

  /** Flex row that holds the icon-button actions at the end of each invitation row */
  invitationRowActions: {
    display: 'flex',
    gap: 0.5,
    justifyContent: 'flex-end',
  },

  /** Column stack inside ViewAdminDialog */
  viewDialogContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },

  /** Email LabelValue spacing inside EditAdminDialog */
  editDialogEmailLabel: {
    mb: 2,
  },

  /** Remove default Paper shadow / padding / bg when FormBuilder sits inside a Dialog */
  formBuilderInDialog: {
    boxShadow: 'none',
    p: 0,
    bgcolor: 'transparent',
  },
  pageIconSize: {
    fontSize: '1.125rem',
  },
} as const satisfies StyleSheet;

export { styles };
