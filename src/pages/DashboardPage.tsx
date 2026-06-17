import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BusinessIcon from '@mui/icons-material/Business';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import { Link } from 'react-router-dom';
import { PageTransition } from '@/shared/components/PageTransition';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/slices/authSlice';

const SECTIONS = [
  {
    label: 'Tenants',
    description: 'Manage tenant organizations',
    icon: BusinessIcon,
    path: '/tenants',
    color: '#1976d2',
  },
  {
    label: 'Users',
    description: 'Manage user accounts and roles',
    icon: PeopleIcon,
    path: '/users',
    color: '#388e3c',
  },
  {
    label: 'Roles',
    description: 'Define access control roles',
    icon: AdminPanelSettingsIcon,
    path: '/roles',
    color: '#7b1fa2',
  },
  {
    label: 'Products',
    description: 'Manage product catalog',
    icon: InventoryIcon,
    path: '/products',
    color: '#f57c00',
  },
  {
    label: 'Reports',
    description: 'View platform analytics',
    icon: AssessmentIcon,
    path: '/reports',
    color: '#c62828',
  },
] as const;

export function DashboardPage() {
  const user = useAppSelector(selectCurrentUser);

  return (
    <PageTransition>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <DashboardIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Dashboard
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Welcome back{user?.fullName ? `, ${user.fullName}` : ''}. Select a section to get started.
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {SECTIONS.map(({ label, description, icon: Icon, path, color }) => (
          <Grid key={path} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea component={Link} to={path} sx={{ height: '100%', p: 0.5 }}>
                <CardContent>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: `${color}18`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <Icon sx={{ color }} />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </PageTransition>
  );
}
