import { useState, Suspense } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/shared/components/PageTransition';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectCurrentUser, selectRefreshToken } from '@/features/auth/slices/authSlice';
import { selectThemeMode, toggleTheme } from '@/features/ui/uiSlice';
import { useLogoutMutation } from '@/features/auth/api/authApi';
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
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import BusinessIcon from '@mui/icons-material/Business';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';

const DRAWER_WIDTH = 240;

const NAV_ITEMS = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Tenants', icon: <BusinessIcon />, path: '/tenants' },
  { text: 'Users', icon: <PeopleIcon />, path: '/users' },
  { text: 'Roles', icon: <AdminPanelSettingsIcon />, path: '/roles' },
  { text: 'Products', icon: <InventoryIcon />, path: '/products' },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
] as const;

function PageLoader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, py: 8 }}>
      <CircularProgress />
    </Box>
  );
}

export function DashboardLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector(selectCurrentUser);
  const themeMode = useAppSelector(selectThemeMode);
  const refreshToken = useAppSelector(selectRefreshToken);
  const [logoutMutation] = useLogoutMutation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleThemeToggle = () => dispatch(toggleTheme());
  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);
  const handleAvatarClick = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleMenuClose();
    if (refreshToken) {
      await logoutMutation({ refreshToken });
    }
    navigate('/login', { replace: true });
  };

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
        {NAV_ITEMS.map(({ text, icon, path }) => (
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
        <Toolbar>
          <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flex: 1 }} />
          <Tooltip title={themeMode === 'dark' ? 'Light mode' : 'Dark mode'}>
            <IconButton onClick={handleThemeToggle}>
              {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          <Tooltip title={user?.fullName ?? user?.email ?? 'Account'}>
            <IconButton onClick={handleAvatarClick} sx={{ ml: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13 }}>
                {initials}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem disabled sx={{ flexDirection: 'column', alignItems: 'flex-start', opacity: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {user?.fullName ?? 'User'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
          Sign out
        </MenuItem>
      </Menu>

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
