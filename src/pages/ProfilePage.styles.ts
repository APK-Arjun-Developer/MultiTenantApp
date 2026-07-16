import type { StyleSheet } from '@/types';

export const styles = {
  // Page root container
  root: {},

  // Page header row (icon + title)
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    mb: 3,
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

  // Page title text
  pageTitle: {
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },

  // Avatar + identity summary row
  avatarContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    mb: 3,
  },

  // User name text inside avatar row
  userName: {
    fontWeight: 600,
    lineHeight: 1.3,
  },

  // System role caption
  systemRole: {
    fontWeight: 500,
  },

  // Tabbed paper card
  tabsPaper: {
    borderRadius: 2,
  },

  // Tabs strip
  tabs: {
    borderBottom: 1,
    borderColor: 'divider',
    px: 1,
  },

  // Inner padding for tab panels
  tabPanel: {
    p: 3,
  },

  // Divider inside tab panels
  divider: {
    mb: 2,
  },

  // FormBuilder inline (no card chrome)
  inlineForm: {
    boxShadow: 'none',
    p: 0,
    bgcolor: 'transparent',
  },

  // Company logo row (avatar + label)
  companyLogoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    mb: 3,
  },

  // Divider below company logo row
  companyDivider: {
    mb: 3,
  },

  // Company logo label text
  companyLogoLabel: {
    fontWeight: 600,
  },

  // Sign-out action row
  actionRow: {
    mt: 3,
    display: 'flex',
    justifyContent: 'flex-end',
  },

  // Email LabelValue bottom margin
  emailLabelValue: {
    mb: 2,
  },

  // Loading spinner wrapper
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    py: 8,
  },
  pageIconSize: {
    fontSize: '1.125rem',
  },

  avatarClickable: {
    position: 'relative',
    display: 'inline-flex',
    cursor: 'pointer',
    borderRadius: '50%',
    flexShrink: 0,
  },

  avatarMedium: {
    width: 64,
    height: 64,
    bgcolor: 'primary.main',
    fontSize: '1.375rem',
  },

  avatarOverlay: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    bgcolor: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarOverlayIcon: {
    color: '#fff',
    fontSize: '1.375rem',
  },
} as const satisfies StyleSheet;
