import { memo, Suspense, useCallback, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { AnimatePresence } from 'framer-motion';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { authApi } from '@/features/auth/api/authApi';
import {
  selectCurrentUser,
  selectImpersonatedBy,
  selectIsImpersonating,
  selectPermissions,
  selectPermissionsLoaded,
} from '@/features/auth/slices/authSlice';
import { useStopImpersonationMutation } from '@/features/impersonation/api/impersonationApi';
import { selectThemeMode, toggleTheme } from '@/features/ui/uiSlice';
import { getUserAvatarUrl, useGetCurrentUserQuery } from '@/features/users/api/usersApi';
import { apiSlice } from '@/shared/api/apiSlice';
import { Icon, PageTransition, TenantPicker } from '@/shared/components';
import { usePageTitle } from '@/shared/hooks';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import type { ThemeMode } from '@/shared/theme';
import type { ApiError } from '@/types/api';

import { navLinkStyle, styles } from './DashboardLayout.styles';
import type { NavItem } from './DashboardLayout.types';

const NAV_ITEMS: NavItem[] = [
  {
    text: 'Dashboard',
    icon: <Icon name="Dashboard" />,
    path: '/dashboard',
  },
  {
    text: 'Tenants',
    icon: <Icon name="Business" />,
    path: '/tenants',
    allowedRoles: ['SystemAdmin'],
    permission: 'Tenants.View',
  },
  {
    text: 'Tenant Admins',
    icon: <Icon name="ManageAccounts" />,
    path: '/tenant-admins',
    allowedRoles: ['SystemAdmin'],
    permission: 'Tenants.View',
  },
  {
    text: 'Roles',
    icon: <Icon name="AdminPanelSettings" />,
    path: '/roles',
    allowedRoles: ['TenantAdmin', 'SystemAdmin'],
    permission: 'Roles.View',
  },
  {
    text: 'Users',
    icon: <Icon name="People" />,
    path: '/users',
    allowedRoles: ['TenantAdmin', 'SystemAdmin'],
    permission: 'Users.View',
  },
  {
    text: 'Audit Log',
    icon: <Icon name="History" />,
    path: '/audit-logs',
    allowedRoles: ['SystemAdmin'],
  },
];

const TENANT_CONTEXT_PATHS = ['/users', '/roles', '/audit-logs'];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface DashboardNavItemProps {
  item: NavItem;
  collapsed: boolean;
  onClose: () => void;
}

const DashboardNavItem = memo(({ item, collapsed, onClose }: DashboardNavItemProps) => {
  const { text, icon, path } = item;

  const navLink = (
    <NavLink to={path} style={navLinkStyle}>
      {({ isActive }) => (
        <ListItemButton
          selected={isActive}
          onClick={onClose}
          sx={collapsed ? styles.navItemCollapsed : styles.navItem}
        >
          <ListItemIcon sx={collapsed ? styles.navItemIconCollapsed : styles.navItemIcon}>
            {icon}
          </ListItemIcon>
          <ListItemText
            primary={text}
            slotProps={{
              primary: { sx: isActive ? styles.navItemLabelActive : styles.navItemLabel },
            }}
            sx={collapsed ? styles.navItemTextCollapsed : styles.navItemText}
          />
        </ListItemButton>
      )}
    </NavLink>
  );

  return (
    <ListItem disablePadding>
      {collapsed ? (
        <Tooltip title={text} placement="right" arrow>
          {navLink}
        </Tooltip>
      ) : (
        navLink
      )}
    </ListItem>
  );
});

interface DashboardSidebarProps {
  visibleNavItems: NavItem[];
  collapsed: boolean;
  onClose: () => void;
  onBrandClick: () => void;
}

const DashboardSidebar = memo(
  ({ visibleNavItems, collapsed, onClose, onBrandClick }: DashboardSidebarProps) => {
    const mainItems = visibleNavItems.filter((item) => item.path !== '/profile');
    const accountItems = visibleNavItems.filter((item) => item.path === '/profile');

    return (
      <Box sx={styles.drawer}>
        <Toolbar sx={collapsed ? styles.sidebarToolbarCollapsed : styles.sidebarToolbar}>
          <Tooltip title={collapsed ? 'Expand' : 'Collapse'} placement="right">
            <ButtonBase
              onClick={onBrandClick}
              sx={collapsed ? styles.brandContainerCollapsed : styles.brandContainer}
              focusRipple
            >
              <Box sx={styles.brandMark}>M</Box>
              <Typography
                variant="h6"
                sx={[
                  styles.drawerTitle,
                  collapsed ? styles.brandTitleCollapsed : styles.brandTitleExpanded,
                ]}
                noWrap
              >
                MultiTenant
              </Typography>
            </ButtonBase>
          </Tooltip>
        </Toolbar>
        <Divider />
        <List sx={styles.navList}>
          {mainItems.map((item) => (
            <DashboardNavItem key={item.path} item={item} collapsed={collapsed} onClose={onClose} />
          ))}
        </List>
        {accountItems.length > 0 && (
          <>
            <Divider />
            <List sx={styles.navBottomList}>
              {accountItems.map((item) => (
                <DashboardNavItem
                  key={item.path}
                  item={item}
                  collapsed={collapsed}
                  onClose={onClose}
                />
              ))}
            </List>
          </>
        )}
      </Box>
    );
  },
);

interface DashboardAppBarProps {
  themeMode: ThemeMode;
  showTenantPicker: boolean;
  sidebarCollapsed: boolean;
  onDrawerToggle: () => void;
  onThemeToggle: () => void;
  avatarSrc: string | undefined;
  initials: string;
}

const DashboardAppBar = memo(
  ({
    themeMode,
    showTenantPicker,
    sidebarCollapsed,
    onDrawerToggle,
    onThemeToggle,
    avatarSrc,
    initials,
  }: DashboardAppBarProps) => {
    return (
      <AppBar
        position="fixed"
        elevation={0}
        sx={[styles.appBar, sidebarCollapsed ? styles.appBarCollapsed : styles.appBarExpanded]}
      >
        <Toolbar sx={styles.appBarToolbar}>
          <IconButton edge="start" onClick={onDrawerToggle} sx={styles.menuButton}>
            <Icon name="Menu" />
          </IconButton>

          {showTenantPicker && <TenantPicker />}

          <Box sx={styles.toolbarSpacer} />

          <Tooltip title={themeMode === 'dark' ? 'Light mode' : 'Dark mode'}>
            <IconButton onClick={onThemeToggle} sx={styles.themeToggle}>
              {themeMode === 'dark' ? (
                <Icon name="Brightness7" fontSize="small" />
              ) : (
                <Icon name="Brightness4" fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          <DashboardUserSection avatarSrc={avatarSrc} initials={initials} />
        </Toolbar>
      </AppBar>
    );
  },
);

interface DashboardUserSectionProps {
  avatarSrc: string | undefined;
  initials: string;
}

const DashboardUserSection = memo(({ avatarSrc, initials }: DashboardUserSectionProps) => {
  return (
    <Tooltip title="Profile">
      <IconButton component={Link} to="/profile" sx={styles.profileButton}>
        <Avatar
          src={avatarSrc}
          slotProps={{ img: { crossOrigin: 'use-credentials' } }}
          sx={styles.userAvatar}
        >
          {!avatarSrc && initials}
        </Avatar>
      </IconButton>
    </Tooltip>
  );
});

const PageLoader = memo(() => {
  return (
    <Box sx={styles.pageLoader}>
      <CircularProgress />
    </Box>
  );
});

// ---------------------------------------------------------------------------
// Main layout
// ---------------------------------------------------------------------------

const DashboardLayout = memo(() => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const user = useAppSelector(selectCurrentUser);
  const themeMode = useAppSelector(selectThemeMode);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const permissions = useAppSelector(selectPermissions);
  const permissionsLoaded = useAppSelector(selectPermissionsLoaded);
  const isSystemAdmin = user?.systemRole === 'SystemAdmin';
  const isImpersonating = useAppSelector(selectIsImpersonating);
  const impersonatedBy = useAppSelector(selectImpersonatedBy);
  const snackbar = useSnackbar();
  const [stopImpersonation, { isLoading: isStopping }] = useStopImpersonationMutation();

  usePageTitle();

  const { data: profile } = useGetCurrentUserQuery();

  const navAvatarSrc = useMemo(
    () => (profile?.profileFileId ? getUserAvatarUrl(profile.id) : undefined),
    [profile?.profileFileId, profile?.id],
  );

  const visibleNavItems = useMemo(
    () =>
      NAV_ITEMS.filter((item) => {
        if (
          item.allowedRoles &&
          (!user?.systemRole || !item.allowedRoles.includes(user.systemRole))
        )
          return false;
        if (item.permission && permissionsLoaded && !permissions.includes(item.permission))
          return false;
        return true;
      }),
    [user?.systemRole, permissions, permissionsLoaded],
  );

  const showTenantPicker = useMemo(
    () =>
      isSystemAdmin &&
      TENANT_CONTEXT_PATHS.some(
        (p) => location.pathname === p || location.pathname.startsWith(p + '/'),
      ),
    [isSystemAdmin, location.pathname],
  );

  const initials = useMemo(
    () =>
      user?.fullName
        ? user.fullName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : '?',
    [user?.fullName],
  );

  const handleThemeToggle = useCallback(() => dispatch(toggleTheme()), [dispatch]);
  const handleDrawerToggle = useCallback(() => setMobileOpen((prev) => !prev), []);
  const handleDrawerClose = useCallback(() => setMobileOpen(false), []);
  const handleSidebarToggle = useCallback(() => setSidebarCollapsed((prev) => !prev), []);

  const handleStopImpersonation = useCallback(async () => {
    try {
      await stopImpersonation().unwrap();
      dispatch(apiSlice.util.resetApiState());
      void dispatch(authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }));
      snackbar.success('Impersonation ended. Back to admin session.');
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to stop impersonation.');
    }
  }, [stopImpersonation, dispatch, snackbar]);

  return (
    <Box sx={styles.root}>
      <DashboardAppBar
        themeMode={themeMode}
        showTenantPicker={showTenantPicker}
        sidebarCollapsed={sidebarCollapsed}
        onDrawerToggle={handleDrawerToggle}
        onThemeToggle={handleThemeToggle}
        avatarSrc={navAvatarSrc}
        initials={initials}
      />

      <Box
        component="nav"
        sx={[styles.nav, sidebarCollapsed ? styles.navCollapsed : styles.navExpanded]}
      >
        {/* Mobile: full-width temporary drawer, no collapse */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={styles.drawerTemporary}
        >
          <DashboardSidebar
            visibleNavItems={visibleNavItems}
            collapsed={false}
            onClose={handleDrawerClose}
            onBrandClick={handleDrawerClose}
          />
        </Drawer>

        {/* Desktop: permanent drawer, collapsible */}
        <Drawer
          variant="permanent"
          sx={[
            styles.drawerPermanent,
            sidebarCollapsed ? styles.drawerPermanentCollapsed : styles.drawerPermanentExpanded,
          ]}
          open
        >
          <DashboardSidebar
            visibleNavItems={visibleNavItems}
            collapsed={sidebarCollapsed}
            onClose={handleDrawerClose}
            onBrandClick={handleSidebarToggle}
          />
        </Drawer>
      </Box>

      <Box component="main" sx={styles.mainContent}>
        {isImpersonating && impersonatedBy && (
          <Alert
            severity="warning"
            sx={styles.impersonationAlert}
            action={
              <Button
                color="warning"
                size="small"
                variant="outlined"
                disabled={isStopping}
                onClick={handleStopImpersonation}
              >
                {isStopping ? (
                  <CircularProgress size={14} sx={styles.stopImpersonationSpinner} />
                ) : null}
                Stop Impersonation
              </Button>
            }
          >
            Impersonating <strong>{user?.fullName}</strong> ({user?.email}) — admin:{' '}
            <strong>{impersonatedBy.fullName}</strong>
          </Alert>
        )}
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait" initial={false}>
            <PageTransition motionKey={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </Suspense>
      </Box>
    </Box>
  );
});

export default DashboardLayout;
