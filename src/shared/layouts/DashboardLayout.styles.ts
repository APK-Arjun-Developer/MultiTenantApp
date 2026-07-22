import { type Theme } from '@mui/material/styles';

import { themedIconBoxSx } from '@/shared/theme/styleHelpers';
import type { StyleSheet } from '@/types';

const DRAWER_WIDTH = 240;
const DRAWER_COLLAPSED_WIDTH = 64;

const SIDEBAR_TRANSITION = 'width 225ms cubic-bezier(0.4, 0, 0.6, 1)';
const APPBAR_TRANSITION =
  'width 225ms cubic-bezier(0.4, 0, 0.6, 1), margin-left 225ms cubic-bezier(0.4, 0, 0.6, 1)';

const navLinkStyle = {
  width: '100%',
  textDecoration: 'none',
  color: 'inherit',
} as const;

const styles = {
  root: {
    display: 'flex',
    minHeight: '100vh',
  },

  appBar: {
    transition: APPBAR_TRANSITION,
  },

  appBarToolbar: {
    gap: 0.5,
  },

  menuButton: {
    mr: 0.5,
    display: { md: 'none' },
  },

  toolbarSpacer: { flex: 1 },

  themeToggle: {
    color: 'text.secondary',
    '&:hover': { color: 'text.primary' },
  },

  userAvatar: {
    width: 34,
    height: 34,
    bgcolor: 'primary.dark',
    fontSize: 13,
    fontWeight: 700,
  },

  profileButton: {
    ml: 0.25,
    p: 0.5,
  },

  nav: {
    flexShrink: { md: 0 },
    transition: SIDEBAR_TRANSITION,
  },

  drawerTemporary: {
    display: { xs: 'block', md: 'none' },
    '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
  },

  drawerPermanent: {
    display: { xs: 'none', md: 'block' },
    '& .MuiDrawer-paper': {
      boxSizing: 'border-box',
      overflowX: 'hidden',
      transition: SIDEBAR_TRANSITION,
    },
  },

  drawer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
  },

  sidebarToolbar: {
    px: '18px !important',
  },
  // No justifyContent: 'center' — logo centered via padding so it stays in place
  // while the drawer width animates. Math: (64px drawer - 28px logo) / 2 = 18px.
  sidebarToolbarCollapsed: {
    px: '18px !important',
  },

  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1.25,
    py: 0.25,
    borderRadius: 1.5,
    width: '100%',
  },

  brandContainerCollapsed: {
    display: 'flex',
    alignItems: 'center',
    py: 0.25,
    borderRadius: 1.5,
  },

  brandMark: (t: Theme) => ({
    ...themedIconBoxSx(28, 1.5, 12, 0.45)(t),
    fontWeight: 800,
    fontSize: '0.8125rem',
    letterSpacing: '-0.02em',
    pointerEvents: 'none',
  }),

  drawerTitle: {
    fontWeight: 700,
    fontSize: '0.9375rem',
    letterSpacing: '-0.01em',
    color: 'text.primary',
    pointerEvents: 'none',
  },

  brandTitleExpanded: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    opacity: 1,
    maxWidth: 180,
    transition: 'opacity 0.15s ease 0.1s, max-width 0.2s ease',
  },

  brandTitleCollapsed: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    opacity: 0,
    maxWidth: 0,
    pointerEvents: 'none',
    transition: 'opacity 0.15s ease, max-width 0.2s ease',
  },

  navList: {
    flex: 1,
    pt: 1,
    px: 0,
  },

  navBottomList: {
    pb: 1.5,
    px: 0,
  },

  navItem: {
    mx: 1,
    pl: '14px',
    borderRadius: 2,
    color: 'text.secondary',
    '& .MuiListItemIcon-root': {
      color: 'text.secondary',
    },
  },

  navItemIcon: {
    minWidth: 38,
    transition: 'min-width 225ms cubic-bezier(0.4, 0, 0.6, 1)',
    '& svg': { fontSize: '1.25rem' },
  },

  // Same mx/pl as navItem so the icon sits at an identical absolute position in
  // both states — no movement when toggling. Math: 64px drawer - 2×8px margin =
  // 48px button; (48 - 20px icon) / 2 = 14px padding → icon at 14px from left.
  navItemCollapsed: {
    mx: 1,
    px: '14px',
    borderRadius: 2,
    color: 'text.secondary',
    '& .MuiListItemIcon-root': {
      color: 'text.secondary',
    },
  },

  navItemIconCollapsed: {
    minWidth: 0,
    transition: 'min-width 225ms cubic-bezier(0.4, 0, 0.6, 1)',
    '& svg': { fontSize: '1.25rem' },
  },

  navItemText: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    opacity: 1,
    maxWidth: 200,
    transition: 'opacity 0.15s ease 0.1s, max-width 0.2s ease',
  },

  navItemTextCollapsed: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    opacity: 0,
    maxWidth: 0,
    pointerEvents: 'none',
    transition: 'opacity 0.15s ease, max-width 0.2s ease',
  },

  navItemLabel: {
    fontSize: '0.8125rem',
    fontWeight: 500,
  },

  navItemLabelActive: {
    fontSize: '0.8125rem',
    fontWeight: 600,
  },

  appBarExpanded: {
    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
    ml: { md: `${DRAWER_WIDTH}px` },
  },

  appBarCollapsed: {
    width: { md: `calc(100% - ${DRAWER_COLLAPSED_WIDTH}px)` },
    ml: { md: `${DRAWER_COLLAPSED_WIDTH}px` },
  },

  navExpanded: {
    width: { md: DRAWER_WIDTH },
  },

  navCollapsed: {
    width: { md: DRAWER_COLLAPSED_WIDTH },
  },

  drawerPermanentExpanded: {
    '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
  },

  drawerPermanentCollapsed: {
    '& .MuiDrawer-paper': { width: DRAWER_COLLAPSED_WIDTH },
  },

  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    p: 3,
    mt: '64px',
  },

  impersonationAlert: {
    mb: 2,
    borderRadius: 2,
  },

  stopImpersonationSpinner: {
    mr: 0.5,
  },

  pageLoader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    py: 8,
  },
} as const satisfies StyleSheet;

export { DRAWER_COLLAPSED_WIDTH, DRAWER_WIDTH, navLinkStyle, styles };
