import { memo, useState, useCallback, useMemo, Suspense } from 'react';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import { usePageTitle } from '@/shared/hooks';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/shared/components/PageTransition';
import { TenantPicker } from '@/shared/components/TenantPicker';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  selectCurrentUser,
  selectPermissions,
  selectPermissionsLoaded,
  selectIsImpersonating,
  selectImpersonatedBy,
} from '@/features/auth/slices/authSlice';
import { selectThemeMode, toggleTheme } from '@/features/ui/uiSlice';
import { useGetCurrentUserQuery, getUserAvatarUrl } from '@/features/users/api/usersApi';
import { useStopImpersonationMutation } from '@/features/impersonation/api/impersonationApi';
import { authApi } from '@/features/auth/api/authApi';
import { apiSlice } from '@/shared/api/apiSlice';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import type { ApiError } from '@/types/api';
import type { NavItem } from './DashboardLayout.types';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import BusinessIcon from '@mui/icons-material/Business';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HistoryIcon from '@mui/icons-material/History';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import { styles, DRAWER_WIDTH } from './DashboardLayout.styles';

const NAV_ITEMS: NavItem[] = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
  },
  // Tenant management (TenantAdmin + SystemAdmin acting as a tenant)
  {
    text: 'Users',
    icon: <PeopleIcon />,
    path: '/users',
    allowedRoles: ['TenantAdmin', 'SystemAdmin'],
    permission: 'Users.View',
  },
  {
    text: 'Roles',
    icon: <AdminPanelSettingsIcon />,
    path: '/roles',
    allowedRoles: ['TenantAdmin', 'SystemAdmin'],
    permission: 'Roles.View',
  },
  // Audit log (SystemAdmin only)
  {
    text: 'Audit Log',
    icon: <HistoryIcon />,
    path: '/audit-logs',
    allowedRoles: ['SystemAdmin'],
  },
  // Platform management (SystemAdmin only)
  {
    text: 'Tenants',
    icon: <BusinessIcon />,
    path: '/tenants',
    allowedRoles: ['SystemAdmin'],
    permission: 'Tenants.View',
  },
  {
    text: 'Tenant Admins',
    icon: <ManageAccountsIcon />,
    path: '/tenant-admins',
    allowedRoles: ['SystemAdmin'],
    permission: 'Tenants.View',
  },
  // Account
  {
    text: 'Profile',
    icon: <AccountCircleIcon />,
    path: '/profile',
  },
];

// Pages where SystemAdmin needs the TenantPicker to select a tenant context
const TENANT_CONTEXT_PATHS = ['/users', '/roles', '/audit-logs'];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface DashboardNavItemProps {
  item: NavItem;
  onClose: () => void;
}

const DashboardNavItem = memo(function DashboardNavItem({ item, onClose }: DashboardNavItemProps) {
  const { text, icon, path } = item;
  return (
    <ListItem key={path} disablePadding>
      <NavLink to={path} style={{ width: '100%', textDecoration: 'none', color: 'inherit' }}>
        {({ isActive }) => (
          <ListItemButton selected={isActive} onClick={onClose} sx={styles.navItem}>
            <ListItemIcon sx={styles.navItemIcon}>{icon}</ListItemIcon>
            <ListItemText
              primary={text}
              slotProps={{
                primary: { style: { fontSize: '0.8125rem', fontWeight: isActive ? 600 : 500 } },
              }}
            />
          </ListItemButton>
        )}
      </NavLink>
    </ListItem>
  );
});

interface DashboardSidebarProps {
  visibleNavItems: NavItem[];
  onClose: () => void;
}

const DashboardSidebar = memo(function DashboardSidebar({
  visibleNavItems,
  onClose,
}: DashboardSidebarProps) {
  const mainItems = visibleNavItems.filter((item) => item.path !== '/profile');
  const accountItems = visibleNavItems.filter((item) => item.path === '/profile');

  return (
    <Box sx={styles.drawer}>
      <Toolbar>
        <Box sx={styles.brandContainer}>
          <Box sx={styles.brandMark}>M</Box>
          <Typography variant="h6" sx={styles.drawerTitle} noWrap>
            MultiTenant
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={styles.navList}>
        {mainItems.map((item) => (
          <DashboardNavItem key={item.path} item={item} onClose={onClose} />
        ))}
      </List>
      {accountItems.length > 0 && (
        <>
          <Divider />
          <List sx={styles.navBottomList}>
            {accountItems.map((item) => (
              <DashboardNavItem key={item.path} item={item} onClose={onClose} />
            ))}
          </List>
        </>
      )}
    </Box>
  );
});

interface DashboardAppBarProps {
  themeMode: 'light' | 'dark';
  showTenantPicker: boolean;
  onDrawerToggle: () => void;
  onThemeToggle: () => void;
  avatarSrc: string | undefined;
  initials: string;
}

const DashboardAppBar = memo(function DashboardAppBar({
  themeMode,
  showTenantPicker,
  onDrawerToggle,
  onThemeToggle,
  avatarSrc,
  initials,
}: DashboardAppBarProps) {
  return (
    <AppBar position="fixed" elevation={0} sx={styles.appBar}>
      <Toolbar sx={styles.appBarToolbar}>
        <IconButton edge="start" onClick={onDrawerToggle} sx={styles.menuButton}>
          <MenuIcon />
        </IconButton>

        {/* Tenant picker — SystemAdmin on tenant-scoped pages only */}
        {showTenantPicker && <TenantPicker />}

        <Box sx={styles.toolbarSpacer} />

        <Tooltip title={themeMode === 'dark' ? 'Light mode' : 'Dark mode'}>
          <IconButton onClick={onThemeToggle} sx={styles.themeToggle}>
            {themeMode === 'dark' ? (
              <Brightness7Icon fontSize="small" />
            ) : (
              <Brightness4Icon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        <DashboardUserSection avatarSrc={avatarSrc} initials={initials} />
      </Toolbar>
    </AppBar>
  );
});

interface DashboardUserSectionProps {
  avatarSrc: string | undefined;
  initials: string;
}

const DashboardUserSection = memo(function DashboardUserSection({
  avatarSrc,
  initials,
}: DashboardUserSectionProps) {
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

const PageLoader = memo(function PageLoader() {
  return (
    <Box sx={styles.pageLoader}>
      <CircularProgress />
    </Box>
  );
});

// ---------------------------------------------------------------------------
// Main layout
// ---------------------------------------------------------------------------

export const DashboardLayout = memo(function DashboardLayout() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const user = useAppSelector(selectCurrentUser);
  const themeMode = useAppSelector(selectThemeMode);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  // Show TenantPicker only on pages that need a tenant context
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

  const handleStopImpersonation = useCallback(async () => {
    try {
      await stopImpersonation().unwrap();
      dispatch(apiSlice.util.resetApiState());
      dispatch(authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }));
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
        onDrawerToggle={handleDrawerToggle}
        onThemeToggle={handleThemeToggle}
        avatarSrc={navAvatarSrc}
        initials={initials}
      />

      <Box component="nav" sx={styles.nav}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={styles.drawerTemporary}
        >
          <DashboardSidebar visibleNavItems={visibleNavItems} onClose={handleDrawerClose} />
        </Drawer>
        <Drawer variant="permanent" sx={styles.drawerPermanent} open>
          <DashboardSidebar visibleNavItems={visibleNavItems} onClose={handleDrawerClose} />
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

export { DRAWER_WIDTH };
