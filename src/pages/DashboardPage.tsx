import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { PageTransition } from '@/shared/components/PageTransition';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/slices/authSlice';

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
          Welcome back{user?.fullName ? `, ${user.fullName}` : ''}.
        </Typography>
      </Box>
    </PageTransition>
  );
}
