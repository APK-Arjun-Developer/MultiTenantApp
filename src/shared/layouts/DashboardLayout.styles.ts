import type { SxProps, Theme } from '@mui/material/styles';

type Sx = SxProps<Theme>;

export const DRAWER_WIDTH = 240;

export const styles = {
  root: {
    display: 'flex',
    minHeight: '100vh',
  } as Sx,

  appBar: {
    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
    ml: { md: `${DRAWER_WIDTH}px` },
    borderBottom: 1,
    borderColor: 'divider',
    bgcolor: 'background.paper',
    color: 'text.primary',
  } as Sx,

  appBarToolbar: {
    gap: 1,
  } as Sx,

  menuButton: {
    mr: 1,
    display: { md: 'none' },
  } as Sx,

  toolbarSpacer: {
    flex: 1,
  } as Sx,

  userAvatar: {
    width: 32,
    height: 32,
    bgcolor: 'primary.main',
    fontSize: 13,
  } as Sx,

  profileButton: {
    ml: 0.5,
  } as Sx,

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
      borderRight: 1,
      borderColor: 'divider',
    },
  } as Sx,

  drawer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  } as Sx,

  drawerTitle: {
    fontWeight: 700,
    color: 'primary.main',
  } as Sx,

  navList: {
    flex: 1,
    pt: 1,
  } as Sx,

  navItem: {
    mx: 1,
    borderRadius: 2,
    '&.Mui-selected': {
      bgcolor: 'primary.main',
      color: 'primary.contrastText',
      '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
      '&:hover': { bgcolor: 'primary.dark' },
    },
  } as Sx,

  navItemIcon: {
    minWidth: 40,
  } as Sx,

  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    p: 3,
    mt: '64px',
  } as Sx,

  impersonationAlert: {
    mb: 2,
    borderRadius: 2,
  } as Sx,

  pageLoader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    py: 8,
  } as Sx,

  stopImpersonationSpinner: {
    mr: 0.5,
  } as Sx,
} as const;
