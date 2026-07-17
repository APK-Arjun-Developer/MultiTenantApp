import type { StyleSheet } from '@/types';

const styles = {
  root: {},

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 3,
  },

  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
  },

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
  },

  headerTitleText: {
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },

  headerActions: {
    display: 'flex',
    gap: 1,
  },

  tabsRow: {
    mb: 2,
    borderBottom: 1,
    borderColor: 'divider',
  },

  emptyPermission: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    py: 10,
    textAlign: 'center',
    color: 'text.disabled',
  },

  filterBar: {
    mb: 2,
  },

  actionsCell: {
    display: 'flex',
    gap: 0.5,
    justifyContent: 'flex-end',
  },

  avatarLogo: {
    width: 34,
    height: 34,
    cursor: 'pointer',
    fontSize: '0.8125rem',
    bgcolor: 'primary.dark',
  },

  viewDialogContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },

  wizardActions: {
    display: 'flex',
    gap: 1,
    mt: 1,
  },

  wizardActionFlex: {
    flex: 1,
  },

  formInDialog: {
    boxShadow: 'none',
    p: 0,
    bgcolor: 'transparent',
  },

  formInDialogWithTopMargin: {
    boxShadow: 'none',
    p: 0,
    bgcolor: 'transparent',
    mt: 1,
  },

  tenantNameCell: {
    fontWeight: 500,
  },
  pageIconSize: {
    fontSize: '1.125rem',
  },
  planBadgeFree: {
    color: 'text.disabled',
    borderColor: 'divider',
  },
} as const satisfies StyleSheet;

export { styles };
