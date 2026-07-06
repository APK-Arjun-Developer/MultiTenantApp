import { useState, Suspense } from 'react';
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
} from '@/features/auth/slices/authSlice';
import { selectThemeMode, toggleTheme } from '@/features/ui/uiSlice';
import { useGetCurrentUserQuery, getUserAvatarUrl } from '@/features/users/api/usersApi';
import type { SystemRole } from '@/types/api';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
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

const DRAWER_WIDTH = 240;

interface NavItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  allowedRoles?: SystemRole[];
  permission?: string;
}

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

function PageLoader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, py: 8 }}>
      <CircularProgress />
    </Box>
  );
}

export function DashboardLayout() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const user = useAppSelector(selectCurrentUser);
  const themeMode = useAppSelector(selectThemeMode);
  const [mobileOpen, setMobileOpen] = useState(false);

  const permissions = useAppSelector(selectPermissions);
  const permissionsLoaded = useAppSelector(selectPermissionsLoaded);
  const isSystemAdmin = user?.systemRole === 'SystemAdmin';

  usePageTitle();

  const { data: profile } = useGetCurrentUserQuery();
  const navAvatarSrc = profile?.profileFileId ? getUserAvatarUrl(profile.id) : undefined;

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (item.allowedRoles && (!user?.systemRole || !item.allowedRoles.includes(user.systemRole)))
      return false;
    if (item.permission && permissionsLoaded && !permissions.includes(item.permission))
      return false;
    return true;
  });

  // Show TenantPicker only on pages that need a tenant context
  const showTenantPicker =
    isSystemAdmin &&
    TENANT_CONTEXT_PATHS.some(
      (p) => location.pathname === p || location.pathname.startsWith(p + '/'),
    );

  const handleThemeToggle = () => dispatch(toggleTheme());
  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }} noWrap>
          MultiTenant
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ flex: 1, pt: 1 }}>
        {visibleNavItems.map(({ text, icon, path }) => (
          <ListItem key={path} disablePadding>
            <NavLink to={path} style={{ width: '100%', textDecoration: 'none', color: 'inherit' }}>
              {({ isActive }) => (
                <ListItemButton
                  selected={isActive}
                  onClick={() => setMobileOpen(false)}
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                      '&:hover': { bgcolor: 'primary.dark' },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              )}
            </NavLink>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 1, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Tenant picker — SystemAdmin on tenant-scoped pages only */}
          {showTenantPicker && <TenantPicker />}

          <Box sx={{ flex: 1 }} />

          <Tooltip title={themeMode === 'dark' ? 'Light mode' : 'Dark mode'}>
            <IconButton onClick={handleThemeToggle}>
              {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Profile">
            <IconButton component={Link} to="/profile" sx={{ ml: 0.5 }}>
              <Avatar
                src={navAvatarSrc}
                slotProps={{ img: { crossOrigin: 'use-credentials' } }}
                sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13 }}
              >
                {!navAvatarSrc && initials}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: 1,
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          p: 3,
          mt: '64px',
        }}
      >
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
}
