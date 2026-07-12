import type { SxProps, Theme } from '@mui/material/styles';

type Sx = SxProps<Theme>;

export const DRAWER_WIDTH = 240;

export const styles = {
  root: {
    display: 'flex',
    minHeight: '100vh',
  } as Sx,

  // ── AppBar ──────────────────────────────────────────────────────────────────
  // Background / border handled by MuiAppBar theme override.
  appBar: {
    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
    ml: { md: `${DRAWER_WIDTH}px` },
  } as Sx,

  appBarToolbar: {
    gap: 0.5,
  } as Sx,

  menuButton: {
    mr: 0.5,
    display: { md: 'none' },
  } as Sx,

  toolbarSpacer: { flex: 1 } as Sx,

  themeToggle: {
    color: 'text.secondary',
    '&:hover': { color: 'text.primary' },
  } as Sx,

  // ── User avatar in AppBar ───────────────────────────────────────────────────
  userAvatar: {
    width: 34,
    height: 34,
    bgcolor: 'primary.dark',
    fontSize: 13,
    fontWeight: 700,
    border: '2px solid',
    borderColor: 'primary.light',
    boxSizing: 'border-box',
  } as Sx,

  profileButton: {
    ml: 0.25,
    p: 0.5,
  } as Sx,

  // ── Drawer / sidebar ────────────────────────────────────────────────────────
  nav: {
    width: { md: DRAWER_WIDTH },
    flexShrink: { md: 0 },
  } as Sx,

  drawerTemporary: {
    display: { xs: 'block', md: 'none' },
    '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
  } as Sx,

  drawerPermanent: {
    display: { xs: 'none', md: 'block' },
    '& .MuiDrawer-paper': {
      width: DRAWER_WIDTH,
      boxSizing: 'border-box',
    },
  } as Sx,

  drawer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  } as Sx,

  // ── Brand ───────────────────────────────────────────────────────────────────
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    py: 0.25,
  } as Sx,

  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 1.5,
    background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 800,
    fontSize: '0.8125rem',
    letterSpacing: '-0.02em',
    flexShrink: 0,
    boxShadow: '0 0 12px rgba(124,58,237,0.45)',
  } as Sx,

  drawerTitle: {
    fontWeight: 700,
    fontSize: '0.9375rem',
    letterSpacing: '-0.01em',
    color: 'text.primary',
  } as Sx,

  // ── Nav lists ────────────────────────────────────────────────────────────────
  navList: {
    flex: 1,
    pt: 1,
    px: 0,
  } as Sx,

  navBottomList: {
    pb: 1.5,
    px: 0,
  } as Sx,

  // Non-selected items are dimmed for visual hierarchy.
  // Selected state is handled by MuiListItemButton theme override.
  navItem: {
    mx: 1,
    borderRadius: 2,
    color: 'text.secondary',
    '& .MuiListItemIcon-root': {
      color: 'text.secondary',
    },
  } as Sx,

  navItemIcon: {
    minWidth: 38,
    '& svg': { fontSize: '1.125rem' },
  } as Sx,

  // ── Main content area ────────────────────────────────────────────────────────
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    p: 3,
    mt: '64px',
  } as Sx,

  // ── Impersonation alert ──────────────────────────────────────────────────────
  impersonationAlert: {
    mb: 2,
    borderRadius: 2,
  } as Sx,

  stopImpersonationSpinner: {
    mr: 0.5,
  } as Sx,

  // ── Page loader ──────────────────────────────────────────────────────────────
  pageLoader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    py: 8,
  } as Sx,
} as const;
